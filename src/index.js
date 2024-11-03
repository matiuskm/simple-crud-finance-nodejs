import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router as budgetRoutes } from "./routes/budgets.js";
import { router as expenseRoutes } from "./routes/expenses.js";
import { initDb } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDb();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
