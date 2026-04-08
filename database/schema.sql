CREATE DATABASE IF NOT EXISTS eventos;
USE eventos;

-- Users table (can be students or judges)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('student', 'judge', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY, -- using string IDs based on earlier frontend code ('p1', 'p2', etc.)
    name VARCHAR(255) NOT NULL,
    team VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    members JSON, -- Array of string names
    links JSON, -- Object like {"github": "...", "demo": "..."}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problem Statements
CREATE TABLE IF NOT EXISTS problem_statements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    difficulty VARCHAR(50),
    tags JSON
);

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    judge_email VARCHAR(255) NOT NULL,
    scores JSON, -- E.g. {"Innovation": 5, "Feasibility": 4}
    feedback TEXT,
    total_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Initialize default data for problem_statements if empty...
-- (You can run `source schema.sql` inside your mysql instance to load this)

INSERT IGNORE INTO problem_statements (id, title, description, deadline, difficulty, tags) VALUES 
('s1', 'AI Customer Support Agent', 'Build an intelligent chatbot that can resolve 80% of tier-1 support tickets using LLMs and an internal knowledge base.', '2026-05-15', 'Hard', '["AI/ML", "Backend"]'),
('s2', 'Eco-Tracker Dashboard', 'Create a beautiful, responsive dashboard for users to track their daily carbon footprint with gamification elements.', '2026-05-10', 'Medium', '["Frontend", "Data Viz"]'),
('s3', 'Decentralized Voting System', 'Design a secure, transparent voting system using smart contracts to prevent tampering and ensure anonymity.', '2026-05-20', 'Hard', '["Web3", "Security"]'),
('s4', 'Local Food Rescuers', 'A mobile-first web app connecting restaurants with surplus food to local shelters and food banks in real-time.', '2026-05-12', 'Easy', '["Fullstack", "Mobile-First"]');

INSERT IGNORE INTO projects (id, name, team, category, description, members, links) VALUES 
('p1', 'Adrian Bert — CRM Dashboard', 'Keitoto Studio', 'SaaS', 'A CRM dashboard that helps sales teams track leads, pipeline stages, and outreach performance with role-based access and analytics.', '["Aarav", "Maya", "Sofia", "Rohan"]', '{"github": "https://github.com/example/crm-dashboard", "ppt": "https://example.com/crm-deck", "demo": "https://example.com/crm-demo"}'),
('p2', 'Trust — SaaS Dashboard', 'North Star', 'SaaS', 'A secure admin portal focused on auditability, granular permissions, and a delightful dashboard experience for operations teams.', '["Isha", "Noah", "Liam"]', '{"github": "https://github.com/example/trust-saas", "ppt": "https://example.com/trust-deck", "demo": "https://example.com/trust-demo"}'),
('p3', 'Pertamina Project', 'Blue Circuit', 'Energy', 'A planning tool for field operations to report maintenance status and track safety checks with offline-first syncing.', '["Zara", "Kabir", "Olivia"]', '{"github": "https://github.com/example/pertamina", "ppt": "https://example.com/pertamina-deck", "demo": "https://example.com/pertamina-demo"}'),
('p4', 'Garuda Project', 'SkyWorks', 'Travel', 'A travel experience platform that bundles itinerary planning, local discovery, and smart budgeting into one interface.', '["Ethan", "Aanya", "Lucas", "Meera"]', '{"github": "https://github.com/example/garuda", "ppt": "https://example.com/garuda-deck", "demo": "https://example.com/garuda-demo"}');
