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
  const { title, budget } = req.body;

  //basic validation
  if (!title || typeof budget !== "number" || budget < 0) {
    return res.status(400).json({ error: "Invalid envelope data" });
  }

  //generate new ID
  const newId =
    envelopes.length > 0 ? envelopes[envelopes.length - 1].id + 1 : 1;
  const newEnvelope = { id: newId, title, budget };

  envelopes.push(newEnvelope);
  res.status(201).json(newEnvelope);
});

// GET envelop by id
router.get("/:id", (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const envelope = envelopes.find((env) => env.id === envelopeId);

  if (!envelope) {
    res.status(404).json({ error: "Envelope not found" });
  }
  res.json(envelope);
});

module.exports = router;
