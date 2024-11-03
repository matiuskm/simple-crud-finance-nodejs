import express from "express";
import { body, validationResult } from "express-validator";
import db from "../db.js";

export const router = express.Router();

// Get all expenses
router.get("/", (req, res) => {
  const { category, startDate, endDate } = req.query;
  let query = "SELECT * FROM expenses WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (startDate) {
    query += " AND date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND date <= ?";
    params.push(endDate);
  }

  query += " ORDER BY date DESC";
  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

// Get expense by id
router.get("/:id", (req, res) => {
  const expense = db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(req.params.id);
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json(expense);
});

// Create new expense
router.post(
  "/",
  [
    body("description").notEmpty().trim(),
    body("amount").isFloat({ min: 0 }),
    body("category").notEmpty().trim(),
    body("date").isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, category, date } = req.body;
    const result = db
      .prepare(
        "INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)"
      )
      .run(description, amount, category, date);

    res.status(201).json({ id: result.lastInsertRowid });
  }
);

// Update expense
router.put(
  "/:id",
  [
    body("description").optional().trim(),
    body("amount").optional().isFloat({ min: 0 }),
    body("category").optional().trim(),
    body("date").optional().isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, category, date } = req.body;
    const result = db
      .prepare(
        `
      UPDATE expenses
      SET description = COALESCE(?, description),
          amount = COALESCE(?, amount),
          category = COALESCE(?, category),
          date = COALESCE(?, date)
      WHERE id = ?
    `
      )
      .run(description, amount, category, date, req.params.id);

    if (result.changes === 0)
      return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense updated successfully" });
  }
);

// Delete expense
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM expenses WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Expense not found" });
  res.json({ message: "Expense deleted successfully" });
});

// Get total expenses by category
router.get("/summary/by-category", (req, res) => {
  const { startDate, endDate } = req.query;
  let query = "SELECT category, SUM(amount) as total FROM expenses";
  const params = [];

  if (startDate || endDate) {
    query += " WHERE 1=1";
    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }
  }

  query += " GROUP BY category";
  const summary = db.prepare(query).all(...params);
  res.json(summary);
});
