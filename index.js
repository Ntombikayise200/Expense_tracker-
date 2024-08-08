const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Mock user data
const users = [
  { username: 'user1', password: '$2a$10$R0ZG5DtkWPlR1n0jQ9z6nO9lbU8n1gD5sA2.xVlt5SWBvHOGc1jA2' }, // password: 'password1'
];

// Mock expense data
let expenses = [];

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// User Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Expense Management Endpoints
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const expense = req.body;
  expenses.push(expense);
  res.status(201).json(expense);
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, date, category } = req.body;
  let expense = expenses.find(e => e.id === id);
  if (expense) {
    expense = { ...expense, amount, date, category };
    expenses = expenses.map(e => e.id === id ? expense : e);
    res.json(expense);
  } else {
    res.status(404).json({ message: 'Expense not found' });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  expenses = expenses.filter(e => e.id !== id);
  res.status(204).end();
});

// Expense Calculation Endpoint
app.get('/api/expense', (req, res) => {
  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  res.json({ total: totalExpense });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
