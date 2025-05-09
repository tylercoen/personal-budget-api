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

router.get("/", (req, res) => {
  res.json(envelopes);
});

// POST: create a new envelope
router.post("/", (req, res) => {
  const { name, amount } = req.body;

  //basic validation
  if (!name || typeof amount !== "number" || amount < 0) {
    return res.status(400).json({ error: "Invalid envelope data" });
  }

  //generate new ID
  const newId =
    envelopes.length > 0 ? envelopes[envelopes.length - 1].id + 1 : 1;
  const newEnvelope = { id: newId, name, amount };

  envelopes.push(newEnvelope);
  res.status(201).json(newEnvelope);
});

// GET envelope by id
router.get("/:id", (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const envelope = envelopes.find((env) => env.id === envelopeId);

  if (!envelope) {
    res.status(404).json({ error: "Envelope not found" });
  }
  res.json(envelope);
});

// PUT: udpate an envelope by ID
router.put("/:id", (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const { withdraw, amount, name } = req.body;

  //find the envelope by id
  const envelope = envelopes.find((env) => env.id === envelopeId);

  //If the evenlope doesn't exist
  if (!envelope) {
    return res.status(400).json({ error: "Envelope not found" });
  }
  let messageParts = [];

  // HANDLE WITHDRAWAL
  //ensure the withdraw amount is valid
  if (typeof withdraw === "number") {
    if (withdraw < 0) {
      return res
        .status(400)
        .json({ error: "Withdraw amount must be a non-negative number" });
    }
  }
  //ensure there are enough funds in the envelope
  if (envelope.amount < withdraw) {
    return res
      .status(400)
      .json({ error: "Insufficient funds in the envelope" });
  }
  //subtract the amount from the envelope
  envelope.amount -= withdraw;
  if (withdraw !== undefined) {
    messageParts.push(`withdrew ${withdraw}`);
  }

  //HANDLE SETTING A NEW BUDGET
  if (typeof amount === "number") {
    if (amount < 0) {
      return res
        .status(400)
        .json({ error: "Budget amont must be non-negative" });
    }
    envelope.amount = amount;
    messageParts.push(`updated budget to ${amount}`);
  }

  //Update envelope name
  if (typeof name === "string" && name.trim().length > 0) {
    envelope.name = name.trim();
    messageParts.push(`renamed envelope to ${name.trim()}`);
  }

  //Update the message

  if (messageParts.length === 0) {
    return res.status(400).json({ error: "No valid update fields provided" });
  }
  res.status(200).json({
    message: `Successfully ${messageParts.join(" and ")} for ${envelope.name}.`,
    updatedEnvelope: envelope,
  });
});

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
