const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Example API Endpoint: Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Example API Endpoint: Get all problem statements
app.get('/api/problems', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM problem_statements');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Failed to fetch problem statements" });
    }
});

// Example API Endpoint: Get evaluations
app.get('/api/evaluations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM evaluations');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ error: "Failed to fetch evaluations" });
    }
});

// Fallback to serving the frontend on unmatched routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
