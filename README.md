# Budget and Expense Tracker API

## API Endpoints

### Budgets

- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Expenses

- `GET /api/expenses` - Get all expenses (with optional filters)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/by-category` - Get expenses summary by category

## Request Examples

### Create Budget

```json
POST /api/budgets
{
  "category": "groceries",
  "amount": 500.00,
  "period": "monthly"
}
```

### Create Expense

```json
POST /api/expenses
{
  "description": "Weekly groceries",
  "amount": 125.50,
  "category": "groceries",
  "date": "2023-12-20"
}
```

### Filter Expenses

```
GET /api/expenses?category=groceries&startDate=2023-12-01&endDate=2023-12-31
```
