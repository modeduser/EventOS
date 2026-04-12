const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const db = require('./config/db');

async function safeAlter(query) { try { await db.query(query); } catch(e) {} }
async function setupDB() {
    await safeAlter("ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE");
    await safeAlter("ALTER TABLE users ADD COLUMN mentor_name VARCHAR(255)");
    await safeAlter("ALTER TABLE users ADD COLUMN assigned_ps_id VARCHAR(50)");
    await safeAlter("ALTER TABLE users ADD COLUMN full_name VARCHAR(255)");
    
    await db.query(`CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY, admin_email VARCHAR(255), action VARCHAR(255),
        details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await db.query(`CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        message TEXT, 
        type VARCHAR(50) DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS schedule_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        time_start VARCHAR(100),
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS mentors (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255),
        assigned_team VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await db.query(`CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255) UNIQUE, 
        expected_size INT, 
        leader_name VARCHAR(255), 
        room VARCHAR(100) DEFAULT 'Pending',
        round VARCHAR(50) DEFAULT 'Round 1',
        invite_code VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await db.query(`CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value VARCHAR(255)
    )`);
    try {
        await db.query(`INSERT IGNORE INTO global_settings (setting_key, setting_value) VALUES ('total_rounds', '3')`);
    } catch(e) {}

    
    // Seed an admin user to use the newly created portal
    try {
        await db.query("INSERT IGNORE INTO users (email, password, role) VALUES ('admin@eventos.local', 'admin123', 'admin')");
    } catch(e) {}
}
setupDB();

const logActivity = async (admin_email, action, details) => {
    try { await db.query('INSERT INTO activity_logs (admin_email, action, details) VALUES (?, ?, ?)', [admin_email, action, JSON.stringify(details)]); } catch(e) { console.error(e); }
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT u.*, t.room as team_room, t.round as team_round FROM users u LEFT JOIN teams t ON u.team_name = t.name WHERE u.email = ?', [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.is_banned) return res.status(403).json({ error: "Your account has been banned." });
            
            const passwordMatch = user.password === password;
            
            if (passwordMatch) {
                res.json({ message: "Login successful", user: { ...user, room: user.team_room || user.room, round: user.team_round || 'Round 1' } });
            } else {
                res.status(401).json({ error: "Invalid email or password" });
            }
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, invite_code, full_name } = req.body;
        if (!email || !password || !invite_code || !full_name) {
           return res.status(400).json({ error: "Missing fields" });
        }
        
        // Find mapped team for code
        const [teams] = await db.query('SELECT name FROM teams WHERE invite_code = ?', [invite_code]);
        if (teams.length === 0) {
            return res.status(400).json({ error: "Invalid invite code" });
        }
        
        const team_name = teams[0].name;
        
        await db.query('INSERT INTO users (email, password, team_name, role, full_name) VALUES (?, ?, ?, ?, ?)', [email, password, team_name, 'student', full_name]);
        
        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Email already registered" });
        }
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Failed to sign up" });
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
        const { name, team, category, description, members, links, room, volunteer, submitted_by } = req.body;
        const date = new Date();
        const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
        const rand = Math.random().toString(36).slice(-4).toUpperCase();
        const genId = `PRJ-${dateStr}-${rand}`;

        await db.query(
            'INSERT INTO projects (id, name, team, category, description, members, links, room, volunteer, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [genId, name, team, category, description, JSON.stringify(members || []), JSON.stringify(links || {}), room, volunteer ? JSON.stringify(volunteer) : null, submitted_by]
        );
        res.status(201).json({ message: "Project created successfully", id: genId });
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

app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[{ uCount }]] = await db.query('SELECT COUNT(*) as uCount FROM users WHERE role="student"');
        const [[{ pCount }]] = await db.query('SELECT COUNT(*) as pCount FROM projects');
        const [[{ eCount }]] = await db.query('SELECT COUNT(*) as eCount FROM evaluations');
        const [[{ tCount }]] = await db.query('SELECT COUNT(*) as tCount FROM teams');
        res.json({ users: uCount, projects: pCount, evaluations: eCount, teams: tCount });
    } catch (error) { res.status(500).json({ error: "Error stats" }); }
});

app.get('/api/admin/logs', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: "Error logs" }); }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, email, full_name, team_name, role, is_banned, mentor_name, assigned_ps_id FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: "Error users" }); }
});

app.post('/api/admin/users/:id/ban', async (req, res) => {
    try {
        const { admin_email } = req.body;
        await db.query('UPDATE users SET is_banned = 1 WHERE id = ?', [req.params.id]);
        await logActivity(admin_email || 'admin', 'BAN_USER', { user_id: req.params.id });
        res.json({ message: "User banned" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/admin/users/:id/unban', async (req, res) => {
    try {
        const { admin_email } = req.body;
        await db.query('UPDATE users SET is_banned = 0 WHERE id = ?', [req.params.id]);
        await logActivity(admin_email || 'admin', 'UNBAN_USER', { user_id: req.params.id });
        res.json({ message: "User unbanned" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { admin_email } = req.body;
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        await logActivity(admin_email || 'admin', 'DELETE_USER', { user_id: req.params.id });
        res.json({ message: "User deleted" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/admin/projects/:id/room', async (req, res) => {
    try {
        const { room, admin_email } = req.body;
        await db.query('UPDATE projects SET room = ? WHERE id = ?', [room, req.params.id]);
        await logActivity(admin_email || 'admin', 'ASSIGN_ROOM', { project_id: req.params.id, room });
        res.json({ message: "Room updated" });
    } catch (error) { res.status(500).json({ error: "Error updating room" }); }
});

app.get('/api/admin/teams', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, 
                   (SELECT COUNT(*) FROM users u WHERE u.team_name = t.name AND u.role='student') as current_members
            FROM teams t
            ORDER BY t.created_at DESC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: "Error deleting team" }); }
});

// -- ANNOUNCEMENTS AND SCHEDULE --
app.get('/api/announcements', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json(rows);
    } catch(e) { res.json([]); }
});

app.post('/api/admin/announcements', async (req, res) => {
    try {
        const { message, type, admin_email } = req.body;
        await db.query('INSERT INTO announcements (message, type) VALUES (?, ?)', [message, type || 'info']);
        await logActivity(admin_email || 'admin', 'POST_ANNOUNCEMENT', { message });
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: "Failed"}); }
});

app.delete('/api/admin/announcements/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: "Failed"}); }
});

app.get('/api/schedule', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM schedule_events ORDER BY created_at ASC');
        res.json(rows);
    } catch(e) { res.json([]); }
});

app.post('/api/admin/schedule', async (req, res) => {
    try {
        const { time_start, title, description, location, admin_email } = req.body;
        await db.query('INSERT INTO schedule_events (time_start, title, description, location) VALUES (?, ?, ?, ?)', [time_start, title, description, location]);
        await logActivity(admin_email || 'admin', 'ADD_SCHEDULE_EVENT', { title });
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: "Failed"}); }
});

app.delete('/api/admin/schedule/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM schedule_events WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: "Failed"}); }
});

app.post('/api/admin/teams', async (req, res) => {
    try {
        const { admin_email, name, size, leader } = req.body;
        if (!name) return res.status(400).json({error: "Team name required"});
        
        const code = Math.random().toString(36).slice(-8);
        try {
           await db.query('INSERT INTO teams (name, expected_size, leader_name, invite_code) VALUES (?, ?, ?, ?)', [name.trim(), size || 1, leader || '', code]);
        } catch(e) {
           if(e.code === 'ER_DUP_ENTRY') return res.status(400).json({error: "Team name already exists."});
           throw e;
        }
        await logActivity(admin_email || 'admin', 'CREATE_TEAM', { name, code });
        res.status(201).json({ message: "Team created successfully", code });
    } catch (error) { res.status(500).json({ error: "Error creating team" }); }
});

app.post('/api/admin/teams/:id/room', async (req, res) => {
    try {
        const { room, admin_email } = req.body;
        await db.query('UPDATE teams SET room = ? WHERE id = ?', [room, req.params.id]);
        await logActivity(admin_email || 'admin', 'ASSIGN_TEAM_ROOM', { team_id: req.params.id, room });
        res.json({ message: "Room updated" });
    } catch (error) { res.status(500).json({ error: "Error updating room" }); }
});

app.post('/api/admin/teams/:id/round', async (req, res) => {
    try {
        const { round, admin_email } = req.body;
        await db.query('UPDATE teams SET round = ? WHERE id = ?', [round, req.params.id]);
        await logActivity(admin_email || 'admin', 'ASSIGN_TEAM_ROUND', { team_id: req.params.id, round });
        res.json({ message: "Round updated" });
    } catch (error) { res.status(500).json({ error: "Error updating round" }); }
});

app.post('/api/admin/allot/mentor', async (req, res) => {
    try {
        const { admin_email, user_id, mentor_name } = req.body;
        await db.query('UPDATE users SET mentor_name = ? WHERE id = ?', [mentor_name, user_id]);
        await logActivity(admin_email || 'admin', 'ASSIGN_MENTOR', { user_id, mentor_name });
        res.json({ message: "Mentor assigned" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/admin/allot/ps', async (req, res) => {
    try {
        const { admin_email, user_id, ps_id } = req.body;
        await db.query('UPDATE users SET assigned_ps_id = ? WHERE id = ?', [ps_id, user_id]);
        await logActivity(admin_email || 'admin', 'ASSIGN_PS', { user_id, ps_id });
        res.json({ message: "Problem statement assigned" });
    } catch (error) { res.status(500).json({ error: "Error" }); }
});

app.post('/api/admin/judges', async (req, res) => {
    try {
        const { email, password, full_name, admin_email } = req.body;
        if (!email || !password || !full_name) return res.status(400).json({ error: "Missing fields" });
        await db.query('INSERT INTO users (email, password, role, full_name) VALUES (?, ?, ?, ?)', [email, password, 'judge', full_name]);
        await logActivity(admin_email || 'admin', 'CREATE_JUDGE', { email, full_name });
        res.status(201).json({ message: "Judge successfully registered." });
    } catch(err) {
        if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already registered" });
        res.status(500).json({ error: "Failed to create judge account" });
    }
});

app.get('/api/admin/settings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value FROM global_settings');
        const settings = {};
        for (const row of rows) settings[row.setting_key] = row.setting_value;
        res.json(settings);
    } catch(e) { res.status(500).json({ error: "Failed to load settings" }); }
});

app.post('/api/admin/settings', async (req, res) => {
    try {
        const { total_rounds, admin_email } = req.body;
        if (total_rounds) {
            await db.query(`INSERT INTO global_settings (setting_key, setting_value) VALUES ('total_rounds', ?) ON DUPLICATE KEY UPDATE setting_value = ?`, [total_rounds, total_rounds]);
            await logActivity(admin_email || 'admin', 'UPDATE_SETTINGS', { total_rounds });
        }
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: "Failed to save settings" }); }
});

const messagesMemory = [];
app.get('/api/messages', (req, res) => {
    res.json(messagesMemory);
});

app.post('/api/messages', (req, res) => {
    const { message, sender } = req.body;
    if (message) messagesMemory.push({ id: Date.now(), message, sender: sender || 'Participant', created_at: new Date() });
    res.json({ success: true });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
