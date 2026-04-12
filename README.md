# 🚀 EventOS

A fast, lightweight, and unified Hackathon & Event Management Platform. 

EventOS brings organizers, hackers, and judges together under one roof. No more messy spreadsheets or disconnected Discord servers—manage your entire event through isolated, role-specific portals syncing securely in real-time.

### ✨ Features
* **👩‍💻 Participant Hub:** Join teams, submit GitHub/Demo links, and view live global leaderboards.
* **⚖️ Judge Sandbox:** Blind-grading interface providing objective scoring rubrics tied strictly to the main leaderboard.
* **👑 Admin Dashboard:** God-mode control. Add judges, manage rooms, track live statistics, ban users, and deploy global announcements instantly.

### 🛠️ Tech Stack
* **Frontend:** Vanilla HTML/CSS paired with lightweight React DOM injection (SPA).
* **Backend:** Node.js + Express REST API.
* **Database:** MySQL.

---

## ⚡ Quick Start

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/modeduser/EventOS.git
   cd EventOS
   npm install
   ```

2. **Configure Environment**
   Set up your local MySQL database and create a `.env` file in the root directory:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_password
   DB_PORT=3306
   ```

3. **Run the Application**
   ```bash
   node server.js
   ```
   *Then head over to `http://localhost:3000` in your web browser!*
