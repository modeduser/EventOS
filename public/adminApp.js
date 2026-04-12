import { React, useState, useEffect, useMemo, html } from "./core.js";

function navTo(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

const ADMIN_AUTH_KEY = "admin_auth_v1";

function loadAdminAuth(systemStore) {
  if (systemStore && systemStore.auth && systemStore.auth.role === 'admin') return systemStore.auth;
  try {
    const r = localStorage.getItem(ADMIN_AUTH_KEY);
    return r ? JSON.parse(r) : { email: "" };
  } catch { return { email: "" }; }
}
function saveAdminAuth(auth) {
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(auth));
}

function Icon({ name }) {
    const common = { className: "navIcon", viewBox: "0 0 24 24", fill: "none" };
    if (name === "dashboard") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM4 20h7v-5H4v5zM13 4h7v5h-7V4z" /></svg>`;
    }
    if (name === "users") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    }
    if (name === "submissions") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    }
    if (name === "logs") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
    }
    if (name === "teams") {
        return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    }
    if (name === "logout") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M10 17l1 1 7-7-7-7-1 1 6 6-6 6z" /><path d="M4 12h12" /></svg>`;
    }
    if (name === "search") {
      return html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style=${{ opacity: 0.8 }}><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>`;
    }
    if (name === "announcements") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`; // Bell icon
    }
    if (name === "schedule") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; // Calendar icon
    }
    if (name === "messages") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
    }
    return html`<span />`;
}

function Topbar({ title, subtitle, right }) {
    return html`<div className="topbar">
      <div className="crumbs">
        <div style=${{ display: "grid", gap: "2px", minWidth: 0 }}>
          <div className="crumbTitle">${title}</div>
          <div className="crumbMeta">${subtitle}</div>
        </div>
      </div>
      <div className="topActions">${right}</div>
    </div>`;
}

function AdminSidebar({ routePath, email, onLogout }) {
    const navOps = [
      { path: "/admin/dashboard", label: "Overview Map", icon: "dashboard" },
      { path: "/admin/users", label: "User Management", icon: "users" },
      { path: "/admin/submissions", label: "Submissions", icon: "submissions" },
      { path: "/admin/teams", label: "Team List", icon: "teams" },
      { path: "/admin/announcements", label: "Announcements", icon: "announcements" },
      { path: "/admin/schedule", label: "Schedule", icon: "schedule" },
      { path: "/admin/messages", label: "Message Inbox", icon: "messages" },
      { path: "/admin/logs", label: "Activity Logs", icon: "logs" },
    ];
    const navLeaderboard = [
      { path: "/admin/leaderboard", label: "Live Rankings", icon: "users" }
    ];
    return html`<aside className="sidebar">
      <div className="brandRow">
        <div className="brandLogo"></div>
        <div className="brandText" style=${{ display: "grid", gap: "2px" }}>
          <div className="brandTitle homeGradientText" style=${{fontSize: 16}}>Admin Portal</div>
          <div className="brandSub">Command Center</div>
        </div>
      </div>
      <div>
        <div className="navGroupTitle">Operations</div>
        <nav className="nav">
          ${navOps.map(it => html`<a className=${`navItem ${routePath === it.path ? "active" : ""}`} href=${`#${it.path}`}><${Icon} name=${it.icon} /><span>${it.label}</span></a>`)}
        </nav>
      </div>
      <div style=${{ marginTop: 16 }}>
        <div className="navGroupTitle">Leaderboard</div>
        <nav className="nav">
          ${navLeaderboard.map(it => html`<a className=${`navItem ${routePath === it.path ? "active" : ""}`} href=${`#${it.path}`}><${Icon} name=${it.icon} /><span>${it.label}</span></a>`)}
        </nav>
      </div>
      <div className="sidebarFooter">
        <div className="pill" style=${{ flex: 1, minWidth: 0, overflow: 'hidden' }}><div className="avatar" style=${{ flexShrink: 0 }}></div><span style=${{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>${email || "Admin"}</span></div>
        <button className="btn danger" style=${{ padding: "6px 12px", flexShrink: 0 }} onClick=${onLogout} title="Logout"><${Icon} name="logout" /></button>
      </div>
    </aside>`;
}

function AdminDashboard({ email }) {
    const [stats, setStats] = useState({ users: 0, projects: 0, evaluations: 0, teams: 0 });
    const [rounds, setRounds] = useState(3);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d)).catch(console.error);
        fetch('/api/admin/settings').then(r => r.json()).then(s => {
            if (s.total_rounds) setRounds(parseInt(s.total_rounds, 10) || 3);
        }).catch(console.error);
    }, []);

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total_rounds: rounds, admin_email: email })
            });
            setTimeout(() => setSaving(false), 800);
        } catch(e) { setSaving(false); }
    };

    return html`<div className="content">
        <div className="grid3" style=${{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            <div className="stat"><div className="statLabel">Participants</div><div className="statValue">${stats.users}</div><div className="statHint">Registered students</div></div>
            <div className="stat"><div className="statLabel">Teams</div><div className="statValue">${stats.teams}</div><div className="statHint">Active teams</div></div>
            <div className="stat"><div className="statLabel">Project Submissions</div><div className="statValue">${stats.projects}</div><div className="statHint">Ideas submitted</div></div>
            <div className="stat"><div className="statLabel">Evaluations Done</div><div className="statValue">${stats.evaluations}</div><div className="statHint">Scored by judges</div></div>
        </div>
        <div style=${{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12}}>
            <div className="card cardPad">
                <div style=${{ fontWeight: 850 }}>System Status</div>
                <div style=${{ marginTop: 4, color: "var(--success)" }}>● All systems operational</div>
            </div>
            
            <div className="card cardPad">
                <div style=${{ fontWeight: 850, marginBottom: 12 }}>Global Settings</div>
                <div className="field" style=${{marginBottom: 0}}>
                    <div className="label">Total Hackathon Rounds</div>
                    <div style=${{display: "flex", gap: 8, alignItems: "center"}}>
                        <input type="number" min="1" max="10" className="input" style=${{width: 80}} value=${rounds} onInput=${(e) => setRounds(e.target.value)} />
                        <button className="btn outline" onClick=${saveSettings} disabled=${saving}>${saving ? "Saved ✓" : "Update"}</button>
                    </div>
                    <div style=${{fontSize: 11, color: "var(--muted)", marginTop: 6}}>Modifying this changes the drop-down ranges in the Team List portal.</div>
                </div>
            </div>
        </div>
    </div>`;
}

function AdminUsers({ email, setToast }) {
   const [users, setUsers] = useState([]);
   const [search, setSearch] = useState("");
   const [roleFilter, setRoleFilter] = useState("all");
   const [showAdd, setShowAdd] = useState(false);
   const [addForm, setAddForm] = useState({ email: "", password: "", full_name: "" });
   const [loading, setLoading] = useState(false);
   
   const load = () => fetch('/api/admin/users').then(r=>r.json()).then(setUsers);
   useEffect(() => { load(); }, []);

   const addJudge = async (e) => {
       e.preventDefault();
       setLoading(true);
       try {
           const res = await fetch('/api/admin/judges', {
               method: "POST", headers: {"Content-Type": "application/json"},
               body: JSON.stringify({ admin_email: email, ...addForm })
           });
           const data = await res.json();
           if(!res.ok) throw new Error(data.error || "Failed to create judge");
           setToast({ type: "success", title: "Judge Created", message: `Successfully registered ${addForm.full_name}.` });
           setShowAdd(false);
           setAddForm({ email: "", password: "", full_name: "" });
           load();
       } catch(err) {
           setToast({ type: "error", title: "Failed", message: err.message });
       }
       setLoading(false);
   };

   const banUser = async (id) => {
       if(!confirm("Are you sure you want to ban this user?")) return;
       await fetch(`/api/admin/users/${id}/ban`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({admin_email: email}) });
       setToast({ type: "success", title: "Banned", message: "User has been banned." });
       load();
   };
   const unbanUser = async (id) => {
       await fetch(`/api/admin/users/${id}/unban`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({admin_email: email}) });
       setToast({ type: "success", title: "Unbanned", message: "User is active again." });
       load();
   };

   const roleColors = {
       student: { bg: 'rgba(109,76,255,.1)', color: 'rgba(109,76,255,.9)', border: 'rgba(109,76,255,.2)' },
       admin:   { bg: 'rgba(225,29,72,.1)', color: 'rgba(225,29,72,.9)', border: 'rgba(225,29,72,.2)' },
       judge:   { bg: 'rgba(22,163,74,.1)', color: 'rgba(22,163,74,.9)', border: 'rgba(22,163,74,.2)' },
   };

   const filtered = users
       .filter(u => roleFilter === 'all' || u.role === roleFilter)
       .filter(u => `${u.email} ${u.team_name} ${u.full_name}`.toLowerCase().includes(search.toLowerCase()));

   return html`<div className="content">
      <div className="card cardPad">
          <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
             <h3>Participant Management</h3>
             <div style=${{display: "flex", gap: 8, alignItems: "center"}}>
                <div style=${{display: "flex", gap: 4}}>
                   ${['all','student','judge','admin'].map(r => html`
                   <button onClick=${() => setRoleFilter(r)} style=${{padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)', background: roleFilter === r ? 'var(--brand)' : 'white', color: roleFilter === r ? 'white' : 'var(--text)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize'}}>${r}</button>
                   `)}
                </div>
                 <div className="search" style=${{ width: 240 }}>
                     <input value=${search} onInput=${e => setSearch(e.target.value)} placeholder="Search..." />
                 </div>
                 <button className="btn primary" onClick=${() => setShowAdd(!showAdd)}>+ Add Judge</button>
              </div>
           </div>

           ${showAdd ? html`
              <form onSubmit=${addJudge} className="card cardPad" style=${{ marginBottom: 16, background: "var(--bg)" }}>
                 <div style=${{ fontWeight: 800, marginBottom: 12 }}>Create Judge Profile</div>
                 <div style=${{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div className="field" style=${{ marginBottom: 0 }}>
                       <div className="label">Full Name</div>
                       <input className="input" value=${addForm.full_name} onInput=${e=>setAddForm({...addForm, full_name: e.target.value})} placeholder="Jane Doe" required />
                    </div>
                    <div className="field" style=${{ marginBottom: 0 }}>
                       <div className="label">Email Contact</div>
                       <input className="input" type="email" value=${addForm.email} onInput=${e=>setAddForm({...addForm, email: e.target.value})} placeholder="judge@eventos.com" required />
                    </div>
                    <div className="field" style=${{ marginBottom: 0 }}>
                       <div className="label">Plaintext Password</div>
                       <input className="input" type="text" value=${addForm.password} onInput=${e=>setAddForm({...addForm, password: e.target.value})} placeholder="Password" required />
                    </div>
                 </div>
                 <div style=${{ marginTop: 16, display: "flex", gap: 10 }}>
                     <button type="submit" className="btn primary" disabled=${loading}>${loading ? "Creating..." : "Save Judge"}</button>
                     <button type="button" className="btn outline" onClick=${() => setShowAdd(false)}>Cancel</button>
                 </div>
              </form>
           ` : ''}
          <table className="table">
              <thead><tr><th>ID</th><th>Full Name</th><th>Email</th><th>Team</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                  ${filtered.map(u => {
                      const rc = roleColors[u.role] || roleColors.student;
                      return html`<tr style=${{background: u.is_banned ? 'rgba(239,68,68,.03)' : 'transparent'}}>
                          <td style=${{color: "var(--muted)", fontSize: 12}}>#${u.id}</td>
                          <td><b>${u.full_name || '—'}</b></td>
                          <td style=${{fontSize: 13}}>${u.email}</td>
                          <td>${u.team_name ? html`<span style=${{fontSize: 12, fontWeight: 600, color: 'var(--primary)'}}>${u.team_name}</span>` : html`<span style=${{color:'var(--muted)',fontSize:12}}>No team</span>`}</td>
                          <td><span style=${{padding:'3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: rc.bg, color: rc.color, border: '1px solid '+ rc.border, textTransform:'uppercase', letterSpacing: '0.5px'}}>${u.role}</span></td>
                          <td>${u.is_banned ? html`<span className="badge danger">Banned</span>` : html`<span className="badge success">Active</span>`}</td>
                          <td>
                              ${u.role !== 'admin' ? html`<button className=${`btn ${u.is_banned ? 'primary' : 'danger'}`} onClick=${() => u.is_banned ? unbanUser(u.id) : banUser(u.id)} style=${{ padding: "4px 8px" }}>
                                  ${u.is_banned ? 'Unban' : 'Ban'}
                              </button>` : ''}
                          </td>
                      </tr>`;
                  })}
              </tbody>
          </table>
      </div>
   </div>`;
}

function AdminSubmissions({ email }) {
   const [projects, setProjects] = useState([]);
   const load = () => fetch('/api/projects').then(r=>r.json()).then(setProjects);
   useEffect(() => { load(); }, []);

   const exportCSV = () => {
        const headers = ["ID", "Name", "Team", "Category", "Submitted By"];
        const rows = [headers.join(",")];
        projects.forEach(p => {
            rows.push([p.id, `"${p.name}"`, `"${p.team}"`, p.category, p.submitted_by].join(","));
        });
        const blob = new Blob([rows.join("\n")], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; a.download = 'submissions.csv'; a.click();
        window.URL.revokeObjectURL(url);
   };

   return html`<div className="content">
      <div className="card cardPad">
          <div style=${{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
             <h3>Submissions List</h3>
             <button className="btn" onClick=${exportCSV}>Export Submissions (CSV)</button>
          </div>
          <table className="table">
              <thead><tr><th>ID</th><th>Project Name</th><th>Team</th><th>Category</th></tr></thead>
              <tbody>
                  ${projects.map(p => html`<tr>
                      <td>${p.id}</td>
                      <td><b>${p.name}</b></td>
                      <td>${p.team}</td>
                      <td>${p.category}</td>
                  </tr>`)}
              </tbody>
          </table>
      </div>
   </div>`;
}

function AdminLogs() {
    const [logs, setLogs] = useState([]);
    useEffect(() => { fetch('/api/admin/logs').then(r=>r.json()).then(setLogs); }, []);
    return html`<div className="content"><div className="card cardPad"><h3>Activity Logs</h3>
       <table className="table" style=${{marginTop: 16}}>
           <thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Details</th></tr></thead>
           <tbody>
               ${logs.map(l => html`<tr>
                   <td>${new Date(l.created_at).toLocaleString()}</td>
                   <td><b>${l.admin_email}</b></td>
                   <td><span className="pill">${l.action}</span></td>
                   <td><pre style=${{margin:0, fontSize:11}}>${l.details}</pre></td>
               </tr>`)}
           </tbody>
       </table>
    </div></div>`;
}

function AdminTeamList({ email, setToast }) {
    const [teams, setTeams] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", size: 1, leader: "" });
    const [loading, setLoading] = useState(false);
    const [roundFilter, setRoundFilter] = useState("all");

    const [totalRounds, setTotalRounds] = useState(3);

    const ROUNDS = Array.from({length: totalRounds}, (_, i) => `Round ${i+1}`).concat(["Finals", "Eliminated"]);

    const loadTeams = () => fetch('/api/admin/teams').then(r=>r.json()).then(setTeams);
    useEffect(() => { 
        loadTeams(); 
        fetch('/api/admin/settings').then(r=>r.json()).then(s => {
            if (s.total_rounds) setTotalRounds(parseInt(s.total_rounds, 10) || 3);
        }).catch(console.error);
    }, []);

    const addTeam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/teams', {
               method: "POST", headers: {"Content-Type": "application/json"},
               body: JSON.stringify({ admin_email: email, ...addForm })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.error || "Failed to create team");
            setToast({ type: "success", title: "Team Added", message: `Successfully created ${addForm.name}.` });
            setShowAdd(false);
            setAddForm({ name: "", size: 1, leader: "" });
            loadTeams();
        } catch(err) {
            setToast({ type: "error", title: "Failed", message: err.message });
        }
        setLoading(false);
    }

    const assignRoom = async (id, currentRoom) => {
       const newRoom = prompt("Enter new room number/identifier:", currentRoom);
       if (newRoom === null) return;
       try {
           await fetch(`/api/admin/teams/${id}/room`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ room: newRoom, admin_email: email }) });
           setToast({ type: "success", title: "Room Assigned", message: "Room assignment saved."});
           loadTeams();
       } catch(e) { setToast({type: "error", title: "Failed", message: "Could not assign room."}); }
    }

    const assignRound = async (id, currentRound) => {
       const idx = ROUNDS.indexOf(currentRound);
       const options = ROUNDS.map((r, i) => `${i+1}. ${r}`).join('\n');
       const choice = prompt(`Select round (enter number):\n${options}`, idx !== -1 ? idx + 1 : 1);
       if (choice === null) return;
       const newRound = ROUNDS[parseInt(choice) - 1];
       if (!newRound) return;
       try {
           await fetch(`/api/admin/teams/${id}/round`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ round: newRound, admin_email: email }) });
           setToast({ type: "success", title: "Round Updated", message: `Team moved to ${newRound}.`});
           loadTeams();
       } catch(e) { setToast({type: "error", title: "Failed", message: "Could not update round."}); }
    }

    const copyLink = (code) => {
        const url = `${window.location.origin}/#/student/signup?invite=${code}`;
        navigator.clipboard.writeText(url);
        setToast({ type: "success", title: "Copied!", message: "Invite link copied to clipboard."});
    }

    const roundColors = { 'Round 1': '#6d4cff', 'Round 2': '#2563eb', 'Finals': '#16a34a', 'Eliminated': '#9ca3af' };
    const filteredTeams = roundFilter === 'all' ? teams : teams.filter(t => t.round === roundFilter);

    return html`<div className="content">
        <div className="card cardPad">
            <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
               <div>
                 <h3>Team Directory</h3>
                 <div style=${{fontSize: 13, color: "var(--muted)", marginTop: 4}}>Manage participant teams, issue invite links, and assign rooms.</div>
               </div>
               <div style=${{display: "flex", gap: 8, alignItems: "center"}}>
                 <div style=${{display: "flex", gap: 4}}>
                   ${['all', ...ROUNDS].map(r => html`
                   <button onClick=${() => setRoundFilter(r)} style=${{padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)', background: roundFilter === r ? (roundColors[r] || 'var(--brand)') : 'white', color: roundFilter === r ? 'white' : 'var(--text)', cursor: 'pointer', fontSize: 11, fontWeight: 600}}>${r === 'all' ? 'All Rounds' : r}</button>
                   `)}
                 </div>
                 <button className="btn primary" onClick=${() => setShowAdd(true)}>+ Add Team</button>
               </div>
            </div>
            
            <table className="table">
                <thead><tr><th>Team Name</th><th>Capacity</th><th>Leader</th><th>Round</th><th>Room</th><th>Invite Link</th><th>Actions</th></tr></thead>
                <tbody>
                    ${filteredTeams.map(t => {
                        const url = `${window.location.origin}/#/student/signup?invite=${t.invite_code}`;
                        const rColor = roundColors[t.round] || '#6d4cff';
                        return html`<tr>
                           <td><b>${t.name}</b></td>
                           <td><span className=${`badge ${t.current_members >= t.expected_size ? 'success' : ''}`}>${t.current_members} / ${t.expected_size}</span></td>
                           <td>${t.leader_name || "N/A"}</td>
                           <td>
                             <button onClick=${() => assignRound(t.id, t.round)} style=${{padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: rColor+'18', color: rColor, border: '1px solid '+rColor+'40', cursor: 'pointer'}}>${t.round || 'Round 1'}</button>
                           </td>
                           <td>${t.room || "Pending"}</td>
                           <td>
                              <div style=${{display: "flex", gap: 6, alignItems: "center"}}>
                                  <input readOnly value=${url} style=${{background: "rgba(0,0,0,0.02)", border: "1px solid var(--line)", padding: "4px 8px", borderRadius: 4, width: 180, fontSize: 11}} />
                                  <button className="btn outline" onClick=${() => copyLink(t.invite_code)} style=${{padding: "4px 8px", fontSize: 11}}>Copy</button>
                              </div>
                           </td>
                           <td>
                               <button className="btn" onClick=${() => assignRoom(t.id, t.room)} style=${{ padding: "4px 8px" }}>Assign Room</button>
                           </td>
                        </tr>`;
                    })}
                    ${filteredTeams.length === 0 ? html`<tr><td colSpan="7" style=${{textAlign: "center", color: "var(--muted)", padding: 20}}>No teams ${roundFilter !== 'all' ? `in ${roundFilter}` : 'added yet'}.</td></tr>` : null}
                </tbody>
            </table>
        </div>

        ${showAdd ? html`
        <div style=${{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100}}>
            <div className="card cardPad" style=${{width: 400, boxShadow: "0 20px 40px rgba(0,0,0,0.2)"}}>
                <h3 style=${{marginBottom: 16}}>Create New Team</h3>
                <form onSubmit=${addTeam}>
                    <div className="field">
                       <div className="label">Team Name *</div>
                       <input className="input" value=${addForm.name} onInput=${e => setAddForm({...addForm, name: e.target.value})} required placeholder="e.g. Lambda" />
                    </div>
                    <div className="field">
                       <div className="label">Number of People</div>
                       <input className="input" type="number" min="1" value=${addForm.size} onInput=${e => setAddForm({...addForm, size: e.target.value})} required />
                    </div>
                    <div className="field">
                       <div className="label">Team Leader Name</div>
                       <input className="input" value=${addForm.leader} onInput=${e => setAddForm({...addForm, leader: e.target.value})} placeholder="Optional" />
                    </div>
                    <div style=${{display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24}}>
                       <button type="button" className="btn outline" onClick=${() => setShowAdd(false)}>Cancel</button>
                       <button type="submit" className="btn primary" disabled=${loading}>Add Team</button>
                    </div>
                </form>
            </div>
        </div>
        ` : null}
    </div>`;
}

function AdminLeaderboard() {
  const [projects, setProjects] = useState([]);
  const [evals, setEvals] = useState([]);

  useEffect(() => {
     fetch('/api/projects').then(r=>r.json()).then(setProjects);
     fetch('/api/evaluations').then(r=>r.json()).then(setEvals);
  }, []);

  const rows = useMemo(() => {
    const base = projects.map((p) => {
      const pEvals = evals.filter(e => e.project_id == p.id);
      const judgeCount = pEvals.length;
      let sumOfTotals = 0;
      pEvals.forEach(e => {
         sumOfTotals += Number(e.total_score || 0);
      });
      const avgTotal = judgeCount ? Math.round((sumOfTotals / judgeCount) * 10) / 10 : 0;
      return { id: p.id, name: p.name, team: p.team, category: p.category, avgTotal };
    });
    return base.sort((a, b) => b.avgTotal - a.avgTotal);
  }, [projects, evals]);

  return html`<div className="content">
     <div className="card cardPad">
        <h3>Live Leaderboard (Admin)</h3>
        <p style=${{marginTop:4, marginBottom:16, fontSize:13, color:"var(--muted)"}}>Real-time aggregated rankings from all judge evaluations.</p>
        <table className="table">
          <thead><tr><th>Rank</th><th>Project</th><th>Team</th><th>Score Avg</th></tr></thead>
          <tbody>
            ${rows.map((r, idx) => html`<tr>
               <td>${idx + 1}</td>
               <td><b>${r.name}</b></td>
               <td>${r.team}</td>
               <td><span className="badge" style=${{background: "rgba(109,76,255,.15)", color: "var(--primary)"}}><b>${r.avgTotal}</b></span></td>
            </tr>`)}
          </tbody>
        </table>
     </div>
  </div>`;
}

function AdminAnnouncements({ email, setToast }) {
    const [announcements, setAnnouncements] = useState([]);
    const [msg, setMsg] = useState("");
    const load = () => fetch('/api/announcements').then(r=>r.json()).then(setAnnouncements);
    useEffect(() => { load(); }, []);

    const post = async (e) => {
        e.preventDefault();
        await fetch('/api/admin/announcements', { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ message: msg, type: 'info', admin_email: email }) });
        setMsg("");
        setToast({ type: "success", title: "Pushed", message: "Announcement broadcasted globally." });
        load();
    }
    const del = async (id) => {
       await fetch(`/api/admin/announcements/${id}`, {method: "DELETE"});
       load();
    }

    return html`<div className="content">
      <div className="card cardPad">
          <h3>Push Global Announcement</h3>
          <p style=${{color: "var(--muted)", fontSize: 13, marginBottom: 16}}>This will appear on all student and judge dashboards instantly.</p>
          <form onSubmit=${post} style=${{display: "flex", gap: 8}}>
              <input className="input" value=${msg} onInput=${e=>setMsg(e.target.value)} placeholder="Message..." required style=${{flex: 1}}/>
              <button className="btn primary">Broadcast</button>
          </form>
      </div>
      <div className="card cardPad" style=${{marginTop: 16}}>
          <h3>Active Announcements</h3>
          <table className="table" style=${{marginTop: 12}}>
              <thead><tr><th>Message</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                  ${announcements.map(a => html`<tr>
                      <td>${a.message}</td>
                      <td>${new Date(a.created_at).toLocaleString()}</td>
                      <td><button className="btn danger" onClick=${() => del(a.id)}>Delete</button></td>
                  </tr>`)}
              </tbody>
          </table>
      </div>
    </div>`;
}

function AdminSchedule({ email, setToast }) {
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({time_start: "", title: "", description: "", location: ""});
    const load = () => fetch('/api/schedule').then(r=>r.json()).then(setEvents);
    useEffect(() => { load(); }, []);

    const post = async (e) => {
        e.preventDefault();
        await fetch('/api/admin/schedule', { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ...form, admin_email: email }) });
        setForm({time_start: "", title: "", description: "", location: ""});
        setToast({ type: "success", title: "Added", message: "Event added to timeline." });
        load();
    }
    const del = async (id) => {
       await fetch(`/api/admin/schedule/${id}`, {method: "DELETE"});
       load();
    }

    return html`<div className="content">
      <div className="card cardPad">
          <h3>Add Schedule Event</h3>
          <form onSubmit=${post} style=${{display: "grid", gap: 12, marginTop: 16}}>
              <div style=${{display:"flex", gap: 12}}>
                 <input className="input" value=${form.time_start} onInput=${e=>setForm({...form, time_start: e.target.value})} placeholder="Time (e.g. 10:00 AM)" required />
                 <input className="input" style=${{flex:1}} value=${form.title} onInput=${e=>setForm({...form, title: e.target.value})} placeholder="Event Title" required />
              </div>
              <input className="input" value=${form.description} onInput=${e=>setForm({...form, description: e.target.value})} placeholder="Short Description..." />
              <input className="input" value=${form.location} onInput=${e=>setForm({...form, location: e.target.value})} placeholder="Location (e.g. Main Hall)" />
              <button className="btn primary" style=${{justifySelf: "flex-start"}}>Add to Schedule</button>
          </form>
      </div>
      <div className="card cardPad" style=${{marginTop: 16}}>
          <h3>Timeline</h3>
          <table className="table" style=${{marginTop: 12}}>
              <thead><tr><th>Time</th><th>Title</th><th>Location</th><th>Action</th></tr></thead>
              <tbody>
                  ${events.map(a => html`<tr>
                      <td>${a.time_start}</td>
                      <td><b>${a.title}</b></td>
                      <td>${a.location}</td>
                      <td><button className="btn outline" onClick=${() => del(a.id)}>Remove</button></td>
                  </tr>`)}
              </tbody>
          </table>
      </div>
    </div>`;
}

function AdminMessages() {
   const [messages, setMessages] = useState([]);
   useEffect(() => {
       fetch('/api/messages').then(r=>r.json()).then(setMessages).catch(()=>{});
   }, []);

   return html`<div className="content">
      <div className="card cardPad">
          <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Participant Inbox</div>
          ${messages.length === 0 ? html`<div style=${{color: 'var(--muted)', fontSize: 13}}>No messages received yet.</div>` : 
            html`<div style=${{display: 'flex', flexDirection: 'column-reverse', gap: 10}}>
              ${messages.map(m => html`
                 <div className="card" style=${{padding: 12, border: '1px solid var(--line)', boxShadow: 'none'}}>
                    <div style=${{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
                       <div style=${{fontWeight: 800}}>${m.sender}</div>
                       <div style=${{fontSize: 12, color: 'var(--muted)'}}>${new Date(m.created_at).toLocaleString()}</div>
                    </div>
                    <div style=${{fontSize: 14, color: 'rgba(17,24,39,0.9)'}}>${m.message}</div>
                 </div>
              `)}
            </div>`
          }
      </div>
   </div>`;
}

export function AdminApp({ systemStore, setSystemStore, route, setToast }) {
  const [auth, setAuth] = useState(() => loadAdminAuth(systemStore));

  useEffect(() => {
    saveAdminAuth(auth);
  }, [auth]);

  const onLogout = () => {
    setAuth({ email: "", role: "" });
    setSystemStore(prev => ({ ...prev, auth: { email: "", role: "" } }));
    navTo("/judge/login");
  };

  const pathname = route.pathname || "/admin/dashboard";

  // Enforce admin login
  useEffect(() => {
    if (!auth.email || auth.role !== 'admin') {
       if (pathname.startsWith("/admin")) {
           navTo("/judge/login");
       }
    }
  }, [auth.email, auth.role, pathname]);

  if (!auth.email || auth.role !== 'admin') {
      return html`<div style=${{padding:20}}>Redirecting to login...</div>`;
  }

  const title = "Admin Workspace";
  const subtitle = pathname === "/admin/users" ? "Manage Participants and Status" : 
                   pathname === "/admin/submissions" ? "Track Projects" :
                   pathname === "/admin/logs" ? "Real-time audit log" :
                   pathname === "/admin/teams" ? "Manage Teams & Rooms" :
                   pathname === "/admin/announcements" ? "Global Alert System" :
                   pathname === "/admin/schedule" ? "Event Itinerary Planner" :
                   pathname === "/admin/leaderboard" ? "Live Rankings" :
                   pathname === "/admin/messages" ? "Participant Messages" :
                   "Metrics Overview";

  return html`<div className="appShell">
    <${AdminSidebar} routePath=${pathname} email=${auth.email} onLogout=${onLogout} />
    <main className="main">
      <${Topbar} title=${title} subtitle=${subtitle} right=${html`<div className="pill">Admin Mode</div>`} />
      ${pathname === "/admin/dashboard" ? html`<${AdminDashboard} email=${auth.email} />` : 
        pathname === "/admin/users" ? html`<${AdminUsers} email=${auth.email} setToast=${setToast} />` : 
        pathname === "/admin/submissions" ? html`<${AdminSubmissions} email=${auth.email} setToast=${setToast} />` : 
        pathname === "/admin/teams" ? html`<${AdminTeamList} email=${auth.email} setToast=${setToast} />` : 
        pathname === "/admin/announcements" ? html`<${AdminAnnouncements} email=${auth.email} setToast=${setToast} />` : 
        pathname === "/admin/schedule" ? html`<${AdminSchedule} email=${auth.email} setToast=${setToast} />` : 
        pathname === "/admin/leaderboard" ? html`<${AdminLeaderboard} />` : 
        pathname === "/admin/messages" ? html`<${AdminMessages} />` : 
        pathname === "/admin/logs" ? html`<${AdminLogs} />` : 
        html`<${AdminDashboard} email=${auth.email} />`}
    </main>
  </div>`;
}
