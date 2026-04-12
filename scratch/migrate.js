const db = require('../config/db');

async function migrate() {
    console.log("Starting Migration Part 2...");
    
    try {
        await db.query("SET FOREIGN_KEY_CHECKS=0;");
        const [projects] = await db.query('SELECT id FROM projects WHERE id LIKE "sub_%"');
        for (const p of projects) {
            const date = new Date(parseInt(p.id.split('_')[1] || Date.now()));
            const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
            const rand = Math.random().toString(36).slice(-4).toUpperCase();
            const newId = `PRJ-${dateStr}-${rand}`;
            
            await db.query('UPDATE projects SET id = ? WHERE id = ?', [newId, p.id]);
            await db.query('UPDATE evaluations SET project_id = ? WHERE project_id = ?', [newId, p.id]);
            console.log(`Updated ID ${p.id} to ${newId}`);
        }
        await db.query("SET FOREIGN_KEY_CHECKS=1;");
    } catch (e) { console.log("Failed to update projects IDs", e); }

    try {
        const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM schedule_events");
        if (count === 0) {
            const scheduleItems = [
                ['10:00 AM', 'Registration & Breakfast', 'Collect your badges and grab some light breakfast.', 'Foyer'],
                ['11:00 AM', 'Opening Ceremony', 'Welcome address and problem statement briefing.', 'Main Hall'],
                ['12:00 PM', 'Room Allotment & Setup', 'Teams are assigned rooms and begin project setup.', 'Assigned Rooms'],
                ['1:00 PM', 'Hacking Begins', 'Official start of development.', 'Assigned Rooms'],
                ['2:00 PM', 'Lunch Break', 'Catered lunch. Networking opportunity with mentors and judges.', 'Cafeteria'],
                ['6:00 PM', 'Mentor Visit — Round 1', 'Assigned mentors visit teams for an initial progress check.', 'All Rooms'],
                ['8:00 PM', 'Dinner', 'Team dinner. Light refreshments also available in rooms.', 'Cafeteria'],
                ['12:00 AM', 'Round 1 Judging Begins', 'Judges evaluate teams. Each team presents for 5 mins.', 'Assigned Rooms'],
                ['2:00 AM', 'Round 1 Results (Elimination)', 'Top performing teams proceed to the final round sprint.', 'Main Hall'],
                ['8:00 AM', 'Breakfast', 'Morning breakfast to fuel the final push.', 'Cafeteria'],
                ['12:00 PM', 'Code Freeze & Final Submissions', 'All coding must stop.', 'Assigned Rooms'],
                ['12:30 PM', 'Final Round Judging', 'Top teams present on stage.', 'Main Hall'],
                ['3:00 PM', 'Closing Ceremony & Awards', 'Winners announced.', 'Main Hall']
            ];
            for (const [time, title, desc, loc] of scheduleItems) {
                await db.query('INSERT INTO schedule_events (time_start, title, description, location) VALUES (?, ?, ?, ?)', [time, title, desc, loc]);
            }
            console.log("Seeded schedule events");
        }
    } catch (e) { console.log("Failed to seed schedule", e); }


    console.log("Migration finished.");
    process.exit(0);
}

migrate();
