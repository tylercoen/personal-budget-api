const express = require("express");
const router = express.Router();
const pool = require("./db");

// CREATE a new transaction
/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - payment_method
 *               - recipient
 *               - envelope_id
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *               amount:
 *                 type: number
 *                 example: 75.25
 *               payment_method:
 *                 type: string
 *                 example: "Credit Card"
 *               recipient:
 *                 type: string
 *                 example: "Amazon"
 *               envelopes_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Database error
 */

router.post("/", async (req, res) => {
  const { date, amount, payment_method, recipient, envelope_id } = req.body;
  if (!amount | !payment_method | !recipient | !envelope_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO transactions (date, amount, payment_method, recipient, envelope_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? date
          : new Date().toISOString().split("T")[0],
        amount,
        payment_method,
        recipient,
        envelope_id,
      ]
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
/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     responses:
 *       200:
 *         description: List of all transactions
 */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.name AS envelope_name FROM transactions t LEFT JOIN envelopes e ON t.envelope_id = e.id ORDER BY t.date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Database error while fetching transactions" });
  }
});

// READ single transaction by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      `SELECT t.*, e.name AS envelope_name FROM transactions t LEFT JOIN envelopes e ON t.envelope_id = e.id WHERE t.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Database error while fetching transaction" });
  }
});

// UPDATE a transaction
/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               recipient:
 *                 type: string
 *               envelope_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction updated
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Database error
 */
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { date, amount, payment_method, recipient, envelope_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions SET date = COALESCE($1, date), amount = COALESCE($2, amount), payment_method = COALESCE($3, payment_method), recipient = COALESCE($4, recipient), envelope_id = COALESCE($5, envelope_id) WHERE id = $6 RETURNING *`,
      [date, amount, payment_method, recipient, envelope_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({
      message: "Transaction updated successfully",
      transaction: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Database error while updating transaction" });
  }
});

// DELETE a transaction
/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to delete
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Database error
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM transactions WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Database error while deleting transaction" });
  }
});

module.exports = router;
