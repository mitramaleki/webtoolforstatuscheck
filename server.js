const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
const searchRoutes = require('./search');
app.use('/api/search', searchRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('Company Status Researcher backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});