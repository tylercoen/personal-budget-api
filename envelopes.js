const pool = require("./db");
const e = require("express");
const express = require("express");
const router = express.Router();
let envelopes = [
  { id: 1, name: "Groceries", amount: 500 },
  { id: 2, name: "Utilities", amount: 200 },
  { id: 3, name: "Entertainment", amount: 300 },
  { id: 4, name: "Transportation", amount: 150 },
  { id: 5, name: "Savings", amount: 400 },
  { id: 6, name: "Dining Out", amount: 250 },
  { id: 7, name: "Clothing", amount: 100 },
  { id: 8, name: "Health & Fitness", amount: 200 },
];

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM envelopes");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST: create a new envelope
router.post("/", async (req, res) => {
  const { name, amount } = req.body;

  //basic validation
  if (!name || typeof amount !== "number" || amount < 0) {
    return res.status(400).json({ error: "Invalid envelope data" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO envelopes (name, amount) VALUES ($1, $2) RETURNING *",
      [name, amount]
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET envelope by id
router.get("/:id", async (req, res) => {
  const envelopeId = parseInt(req.params.id);
  try {
    const result = await pool.query("SELECT * FROM envelopes WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Envelope not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT: udpate an envelope by ID
router.put("/:id", async (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const { withdraw, amount, name } = req.body;
  let messageParts = [];

  try {
    //retrieve the envelope
    const { rows } = await pool.query("SELECT * FROM envelopes WHERE id = $1", [
      envelopeId,
    ]);
    const envelope = rows[0];
    if (!envelope) {
      return res.status(404).json({ error: "Envelope not found" });
    }
    let newAmount = envelope.amount;

    if (typeof withdraw === "number") {
      if (withdraw < 0 || withdraw > newAmount) {
        return res.status(400).json({ error: "Invalid withdraw amount" });
      }
      newAmount -= withdraw;
      messageParts.push(`withdrew ${withdraw}`);
    }

    if (typeof amount === "number" && amount >= 0) {
      newAmount = amount;
      messageParts.push(`updated budget to ${amount}`);
    }

    const newName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : envelope.name;
    if (newName !== envelope.name) {
      messageParts.push(`renamed enevelope to ${newName}`);
    }

    if (messageParts.length === 0) {
      return res.status(400).json({ error: "No valud update fields provided" });
    }

    const updated = await pool.query(
      "UPDATE envelopes SET name =  $1, amount = $2 WHERE id = $3 RETURNING *",
      [newName, newAmount, envelopeId]
    );

    //send conf message
    res.json({
      message: `Successfully ${messageParts.join(" and ")}.`,
      updatedEnvelope: updated.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

//This all still isn't updated yet.

// DELETE
router.delete("/:id", (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const index = envelopes.findIndex((env) => env.id === envelopeId);
  if (index === -1) {
    res.status(400).json({ error: "Envelope not found" });
  }
  //remove the envelope
  const deleteEnvelope = envelopes.splice(index, 1)[0];
  res.status(200).json({
    message: `Successfully deleted envelope ${deleteEnvelope.name}`,
    deleteEnvelope,
  });
});

router.post("/transfer/:fromId/:toId", (req, res) => {
  const fromId = parseInt(req.params.fromId);
  const toId = parseInt(req.params.toId);
  const { amount } = req.body;

  if (isNaN(fromId) || isNaN(toId)) {
    return res.status(400).json({ error: "Invalid envelope IDs" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Transfer amount must be a positive number" });
  }

  const fromEnvelope = envelopes.find((env) => env.id === fromId);
  const toEnvelope = envelopes.find((env) => env.id === toId);
  if (!fromEnvelope || !toEnvelope) {
    res.status(404).json({ error: "One or both envelopes not found" });
  }
  if (fromEnvelope.amount < amount) {
    return res
      .status(400)
      .json({ error: "Insufficient funds in the source envelope" });
  }
  fromEnvelope.amount -= amount;
  toEnvelope.amount += amount;

  res.status(200).json({
    message: `Transferred $${amount} from ${fromEnvelope.name} to ${toEnvelope.name}.`,
    from: fromEnvelope,
    to: toEnvelope,
  });
});

module.exports = router;
