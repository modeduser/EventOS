const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json({ message: "Login successful", user: rows[0] });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { id, name, team, category, description, members, links, room, volunteer, submitted_by } = req.body;
        await db.query(
            'INSERT INTO projects (id, name, team, category, description, members, links, room, volunteer, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, team, category, description, JSON.stringify(members || []), JSON.stringify(links || {}), room, volunteer ? JSON.stringify(volunteer) : null, submitted_by]
        );
        res.status(201).json({ message: "Project created successfully" });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
});

app.get('/api/problems', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM problem_statements');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Failed to fetch problem statements" });
    }
});

app.get('/api/evaluations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM evaluations');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ error: "Failed to fetch evaluations" });
    }
});

app.post('/api/evaluations', async (req, res) => {
    try {
        const { project_id, judge_email, scores, feedback, total_score } = req.body;
        await db.query(
            'INSERT INTO evaluations (project_id, judge_email, scores, feedback, total_score) VALUES (?, ?, ?, ?, ?)',
            [project_id, judge_email, JSON.stringify(scores), feedback, total_score]
        );
        res.status(201).json({ message: "Evaluation saved successfully" });
    } catch (error) {
        console.error("Error creating evaluation:", error);
        res.status(500).json({ error: "Failed to create evaluation" });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
