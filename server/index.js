const express = require("express");
const cors = require("cors");
const pool = require("./db")
const app = express();
const port = 5000

app.use(cors());
app.use(express.json());

// Simple in-memory user store for development/testing.
// NOTE: This is for development only. Do NOT use in production.
const users = [];

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.post('/api/signup', (req, res) => {
  const { name, email, password, userType } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const emailNorm = String(email).trim().toLowerCase();
  const existing = users.find(u => u.email === emailNorm);
  if (existing) return res.status(400).json({ message: 'User already exists' });
  const newUser = { name: name || '', email: emailNorm, password: String(password), userType: userType || 'student' };
  users.push(newUser);
  const token = 'dev-' + Date.now();
  return res.status(201).json({ token, user: { name: newUser.name, email: newUser.email, userType: newUser.userType } });
});

app.post('/api/login', (req, res) => {
  const { email, password, userType } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const emailNorm = String(email).trim().toLowerCase();
  const user = users.find(u => u.email === emailNorm && u.password === String(password) && u.userType === (userType || u.userType));
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = 'dev-' + Date.now();
  return res.json({ token, user: { name: user.name, email: user.email, userType: user.userType } });
});

app.listen(port, () => {
  console.log(`server has started on port ${port}`)
})