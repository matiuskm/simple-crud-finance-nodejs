import express from "express";
import { body, validationResult } from "express-validator";
import db from "../db.js";

export const router = express.Router();

// Get all budgets
router.get("/", (req, res) => {
  const budgets = db
    .prepare("SELECT * FROM budgets ORDER BY created_at DESC")
    .all();
  res.json(budgets);
});

// Get budget by id
router.get("/:id", (req, res) => {
  const budget = db
    .prepare("SELECT * FROM budgets WHERE id = ?")
    .get(req.params.id);
  if (!budget) return res.status(404).json({ error: "Budget not found" });
  res.json(budget);
});

// Create new budget
router.post(
  "/",
  [
    body("category").notEmpty().trim(),
    body("amount").isFloat({ min: 0 }),
    body("period").isIn(["monthly", "yearly", "weekly"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount, period } = req.body;
    const result = db
      .prepare(
        "INSERT INTO budgets (category, amount, period) VALUES (?, ?, ?)"
      )
      .run(category, amount, period);

    res.status(201).json({ id: result.lastInsertRowid });
  }
);

// Update budget
router.put(
  "/:id",
  [
    body("category").optional().trim(),
    body("amount").optional().isFloat({ min: 0 }),
    body("period").optional().isIn(["monthly", "yearly", "weekly"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount, period } = req.body;
    const result = db
      .prepare(
        `
      UPDATE budgets
      SET category = COALESCE(?, category),
          amount = COALESCE(?, amount),
          period = COALESCE(?, period)
      WHERE id = ?
    `
      )
      .run(category, amount, period, req.params.id);

    if (result.changes === 0)
      return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget updated successfully" });
  }
);

// Delete budget
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM budgets WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Budget not found" });
  res.json({ message: "Budget deleted successfully" });
});
