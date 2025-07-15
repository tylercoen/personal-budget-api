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

/**
 * @swagger
 * /envelopes:
 *   get:
 *     summary: Get all envelopes
 *     responses:
 *       200:
 *         description: List of all envelopes
 *
 */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM envelopes");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * @swagger
 * /envelopes:
 *   post:
 *     summary: Create a new envelope
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Envelope created
 */

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

/**
 * @swagger
 * /envelopes/{id}:
 *   get:
 *     summary: Get a single evelope by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the envelope to retrive
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Envelope found
 *       400:
 *         description: Envelope not found
 */

// GET envelope by id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
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

/**
 * @swagger
 * /envelopes/{id}:
 *   put:
 *     summary: Update an evelope
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               name:
 *                 type: string
 *               withdraw:
 *                 type: number
 *     responses:
 *       200:
 *         description: Envelope updates
 */

// PUT: udpate an envelope by ID
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { withdraw, amount, name } = req.body;
  let messageParts = [];

  try {
    //retrieve the envelope
    const { rows } = await pool.query("SELECT * FROM envelopes WHERE id = $1", [
      id,
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
      [newName, newAmount, id]
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

/**
 * @swagger
 * /envelopes/{id}:
 *   delete:
 *     summary: Delete an evelope
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Envelope deleted
 */

// DELETE
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      "DELETE FROM envelopes WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Envelope not found" });
    }

    res.json({
      message: `Successfully deleted enevelop ${result.rows[0].name}`,
      deletedEnvelope: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * @swagger
 * /envelopes/transfer/{fromId}/{toId}:
 *   post:
 *     summary: Transfer funds between enveloeps
 *     paramters:
 *       - in: path
 *         name: fromId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: toId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transfer completed
 */

// POST
router.post("/transfer/:fromId/:toId", async (req, res) => {
  const fromId = parseInt(req.params.fromId);
  const toId = parseInt(req.params.toId);
  const { amount } = req.body;

  if (
    isNaN(fromId) ||
    isNaN(toId) ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fromResult = await client.query(
      "SELECT * FROM envelopes WHERE id = $1 FOR UPDATE",
      [fromId]
    );
    const toResult = await client.query(
      "SELECT * FROM envelopes WHERE id = $1 FOR UPDATE",
      [toId]
    );

    const from = fromResult.rows[0];
    const to = toResult.rows[0];

    if (!from || !to) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "One or both envelopes not found" });
    }

    if (from.amount < amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient funds" });
    }

    await client.query(
      "UPDATE envelopes SET amount = amount - $1 WHERE id = $2",
      [amount, fromId]
    );
    await client.query(
      "UPDATE envelopes SET amount = amount + $1 WHERE id = $2",
      [amount, toId]
    );

    await client.query("COMMIT");

    res.json({
      message: `Transferred $${amount} from ${from.name} to ${to.name}`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.status(500).json({ error: "Transfer fail" });
  } finally {
    client.release();
  }
});

module.exports = router;
