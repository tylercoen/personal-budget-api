const express = require("express");
const router = express.router();
const pool = require("./db");

// CREATE a new transaction
router.post("/", async (req, res) => {
  const { date, amount, payment_method, recipient, envelope_id } = req.body;
  if (!amount | !payment_method | !recipient | !envelope_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO transactions (date, amount, payment_method, recipient, envelope_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [date | new Date(), amount, payment_method, recipient, envelope_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Database error while creating transaction" });
  }
});

// READ all transactions

// READ single transaction by ID

// UPDATE a transaction

// DELETE a transaction

module.exports = router;
