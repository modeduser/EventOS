import React, { useState, useMemo, useEffect } from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

function navTo(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

const STUDENT_AUTH_KEY = "student_auth_v1";

function loadStudentAuth() {
  try {
    const r = localStorage.getItem(STUDENT_AUTH_KEY);
    return r ? JSON.parse(r) : { email: "" };
  } catch {
    return { email: "" };
  }
}

function saveStudentAuth(auth) {
  localStorage.setItem(STUDENT_AUTH_KEY, JSON.stringify(auth));
}

function StudentLoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password.trim()) {
      setErr("Please enter email and password.");
      return;
    }
    onLogin({ email: email.trim() });
  };

  return html`<div className="loginWrap">
    <div className="card loginCard">
      <div className="loginHero">
        <div style=${{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brandLogo"></div>
          <div style=${{ display: "grid", gap: 2 }}>
            <div style=${{ fontWeight: 850 }}>Student Portal</div>
            <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)" }}>Participant Dashboard</div>
          </div>
        </div>
        <h1 style=${{ marginTop: 18 }}>Submit and track your projects.</h1>
        <p>
          Welcome to the student workspace. Here you can find your assigned room and volunteer, submit your project links, and watch the live leaderboard.
        </p>
        <div className="heroBox">
          <div style=${{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="pill">Project Submissions</span>
            <span className="pill">Live Leaderboard</span>
            <span className="pill">Announcements</span>
          </div>
          <div style=${{ marginTop: 10, fontSize: 12, color: "rgba(107,114,128,.95)" }}>
            Tip: Make sure your GitHub and demo links are completely public before submitting.
          </div>
        </div>
      </div>

      <form className="loginForm" onSubmit=${submit} style=${{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style=${{ fontSize: 18, fontWeight: 800 }}>Student Login</div>
        <div style=${{ marginTop: 6, fontSize: 13, color: "rgba(107,114,128,.95)" }}>
          Log in with your university participant email.
        </div>

        <div className="field" style=${{ marginTop: 24 }}>
          <div className="label">Student Email</div>
          <input className="input" value=${email} onInput=${(e) => setEmail(e.target.value)} type="email" placeholder="student@university.edu" />
        </div>
        <div className="field">
          <div className="label">Password</div>
          <input className="input" value=${password} onInput=${(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </div>

        ${err ? html`<div style=${{ marginTop: 10, fontSize: 12, color: "rgba(185,28,28,.95)" }}>${err}</div>` : null}

        <button className="btn primary" style=${{ width: "100%", marginTop: 14, padding: "12px 14px" }} type="submit">
          Login → Portal
        </button>
      </form>
    </div>
  </div>`;
}

function StudentLeaderboard({ projects, evaluations }) {
  const rows = useMemo(() => {
    const base = projects.map((p) => {
      const entries = Object.values(evaluations[p.id] || {}).filter(e => e.submittedAt);
      const judgeCount = entries.length;
      let sumOfTotals = 0;
      entries.forEach(entry => {
         const t = Object.values(entry.scores || {}).reduce((a, b) => a + Number(b || 0), 0);
         sumOfTotals += t;
      });
      const avgTotal = judgeCount ? Math.round((sumOfTotals / judgeCount) * 10) / 10 : 0;
      
      return {
        id: p.id,
        name: p.name,
        team: p.team,
        category: p.category,
        avgTotal,
      };
    });
    return base.sort((a, b) => b.avgTotal - a.avgTotal);
  }, [projects, evaluations]);

  return html`<div className="card cardPad">
    <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Live Leaderboard</div>
    <div style=${{ overflow: "auto", borderRadius: 14, border: "1px solid var(--line)" }}>
      <table className="table">
        <thead>
          <tr>
            <th style=${{ width: 64 }}>Rank</th>
            <th>Project</th>
            <th>Team</th>
            <th>Category</th>
            <th className="right" style=${{ width: 140 }}>Score Avg</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, idx) => {
            const bgWidth = (r.avgTotal / 50) * 100;
            return html`<tr>
              <td>${idx + 1}</td>
              <td><b>${r.name}</b></td>
              <td>${r.team}</td>
              <td>${r.category}</td>
              <td className="right" style=${{ position: "relative" }}>
                <div style=${{ position: "absolute", top: 6, bottom: 6, left: 10, right: 10, background: "rgba(109,76,255,.05)", borderRadius: 6, zIndex: 0 }}>
                  <div style=${{ height: "100%", width: `${bgWidth}%`, background: "rgba(109,76,255,.15)", borderRadius: 6, transition: "width .3s" }}></div>
                </div>
                <b style=${{ position: "relative", zIndex: 1, marginRight: 16 }}>${r.avgTotal}</b>
              </td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>
  </div>`;
}

function StudentMessages() {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  
  const submit = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSent(true);
    setMsg("");
    setTimeout(() => setSent(false), 3000);
  };

  return html`<div>
    <div className="card cardPad" style=${{ marginBottom: 16 }}>
      <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Announcements</div>
      <div className="pill" style=${{ background: "rgba(22,163,74,.08)", borderColor: "rgba(22,163,74,.15)", display: "block" }}>
        <b>System:</b> Judging for Phase 1 has begun! Please ensure your demo links are accessible to the judges.
      </div>
      <div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)", display: "block", marginTop: 8 }}>
        <b>System:</b> Reminder: Lunch is served in the cafeteria at 1:00 PM.
      </div>
    </div>

    <div className="card cardPad">
      <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Message Hosts</div>
      <form onSubmit=${submit}>
        <div className="field">
          <textarea className="textarea" placeholder="Have a question or need an extension? Message the admins..." value=${msg} onInput=${e => setMsg(e.target.value)}></textarea>
        </div>
        ${sent ? html`<div style=${{ color: "var(--success)", fontSize: 13, marginBottom: 10 }}>Message sent successfully! Admins will assist you soon.</div>` : null}
        <button className="btn primary">Send Message</button>
      </form>
    </div>
  </div>`;
}

export function StudentApp({ systemStore, activeProjects = [], setSystemStore, route, setToast }) {
  const [auth, setAuth] = useState(loadStudentAuth);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    saveStudentAuth(auth);
  }, [auth]);

  const onLogin = (newAuth) => {
    setAuth(newAuth);
    navTo("/student/portal");
  };

  const onLogout = () => {
    setAuth({ email: "" });
    navTo("/student/login");
  };

  const pathname = route.pathname || "/student/login";

  useEffect(() => {
    if (!auth.email && pathname !== "/student/login") navTo("/student/login");
    if (auth.email && pathname === "/student/login") navTo("/student/portal");
  }, [auth.email, pathname]);

  if (!auth.email) {
    return html`<${StudentLoginPage} onLogin=${onLogin} />`;
  }

  // Find own submissions automatically
  const mySubmissions = (systemStore.submissions || []).filter(s => s.members.includes(auth.email));

  const onSubmitProject = (payload) => {
    const newProject = {
      id: "sub_" + Date.now(),
      name: payload.title,
      team: payload.team || "Individual",
      category: payload.category || "Submitted",
      description: payload.description,
      members: [payload.name, auth.email],
      links: {
        github: payload.github,
        demo: payload.demo || "",
        ppt: payload.ppt || "",
      },
      room: "Pending Admin Allotment",
      volunteer: null,
    };
    setSystemStore(prev => ({ ...prev, submissions: [...(prev.submissions || []), newProject] }));
    setToast({ type: "success", title: "Project submitted!", message: "Your submission has been recorded." });
  };

  const TopbarPlaceholder = html`<div className="topbar">
    <div className="crumbs" style=${{ flex: 1 }}>
      <div style=${{ display: "grid", gap: "2px", minWidth: 0 }}>
        <div className="crumbTitle">Student Portal</div>
        <div className="crumbMeta">View problem statements and manage your projects</div>
      </div>
      <div className="tabs" style=${{ marginLeft: 32 }}>
        ${["dashboard", "projects", "leaderboard", "messages"].map(t => html`<div className=${`tab ${tab === t ? "active" : ""}`} onClick=${() => setTab(t)} style=${{ textTransform: "capitalize" }}>${t}</div>`)}
      </div>
    </div>
    <div className="topActions">
      <div className="pill">Welcome, ${auth.email}</div>
      <button className="btn danger" onClick=${onLogout} style=${{ padding: "6px 8px" }}>Logout</button>
    </div>
  </div>`;

  return html`<div className="appShell" style=${{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
    <main className="main" style=${{ padding: "24px 0" }}>
      ${TopbarPlaceholder}
      <div className="content">
        ${tab === "dashboard" ? html`
          <div className="card cardPad" style=${{ marginBottom: 16 }}>
            <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Team & Event Information</div>
            <div style=${{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <div className="card" style=${{ padding: 12, background: "rgba(109,76,255,.04)", border: "1px solid rgba(109,76,255,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 12, color: "var(--muted)" }}>Team Name</div>
                <div style=${{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>${mySubmissions[0]?.team || "Pending Submission"}</div>
              </div>
              <div className="card" style=${{ padding: 12, background: "rgba(109,76,255,.04)", border: "1px solid rgba(109,76,255,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 12, color: "var(--muted)" }}>Team Members</div>
                <div className="chips" style=${{ marginTop: 6 }}>
                  ${mySubmissions.length > 0 ? mySubmissions[0].members.map(m => html`<span className="chip" style=${{ padding: "4px 8px", fontSize: 11, background: "rgba(255,255,255,.9)" }}>${m}</span>`) : html`<span className="chip" style=${{ padding: "4px 8px", fontSize: 11, background: "rgba(255,255,255,.9)" }}>${auth.email} (You)</span>`}
                </div>
              </div>
              <div className="card" style=${{ padding: 12, background: "rgba(109,76,255,.04)", border: "1px solid rgba(109,76,255,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 12, color: "var(--muted)" }}>Room & Volunteer</div>
                <div style=${{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>Room: ${mySubmissions[0]?.room || "Pending Assignment"}</div>
                ${mySubmissions[0]?.volunteer ? html`<div style=${{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>V: ${mySubmissions[0].volunteer.name} (${mySubmissions[0].volunteer.contact})</div>` : null}
              </div>
            </div>
          </div>
          <div className="card cardPad" style=${{ marginBottom: 16 }}>
            <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>My Submissions</div>
            ${mySubmissions.length > 0 ? mySubmissions.map(s => html`<div className="card" style=${{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,.72)", marginBottom: 10, border: "1px solid var(--line)" }}>
              <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style=${{ display: "grid", gap: 4 }}>
                  <div style=${{ fontSize: 16, fontWeight: 800 }}>${s.name}</div>
                  <div style=${{ fontSize: 13, color: "var(--muted)" }}>${s.category}</div>
                </div>
                <div className="badge" style=${{ background: "rgba(109,76,255,.1)", color: "rgba(109,76,255,.9)", border: "1px solid rgba(109,76,255,.2)" }}>Submitted</div>
              </div>
              
              <div style=${{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Team:</b> ${s.team || "Individual"}</div>
                <div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Room:</b> ${s.room || "Pending Admin Allotment"}</div>
                ${s.volunteer ? html`<div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Volunteer:</b> ${s.volunteer.name} (${s.volunteer.contact})</div>` : ""}
              </div>
            </div>`) : html`<div style=${{ color: "var(--muted)", fontSize: 13 }}>You haven't submitted any projects yet. Go to the Projects tab to make a submission.</div>`}
          </div>
        ` : tab === "projects" ? html`
          <${StudentPortalContent} problems=${PROBLEM_STATEMENTS} onSubmitProject=${onSubmitProject} defaultEmail=${auth.email} />
        ` : tab === "leaderboard" ? html`
          <${StudentLeaderboard} projects=${activeProjects} evaluations=${systemStore.evaluations || {}} />
        ` : html`
          <${StudentMessages} />
        `}
      </div>
    </main>
  </div>`;
}

// Below is the transplanted StudentPortalPage
const PROBLEM_STATEMENTS = [
  { id: "s1", title: "AI Customer Support Agent", description: "Build an intelligent chatbot that can resolve 80% of tier-1 support tickets using LLMs and an internal knowledge base.", deadline: "2026-05-15", difficulty: "Hard", tags: ["AI/ML", "Backend"] },
  { id: "s2", title: "Eco-Tracker Dashboard", description: "Create a beautiful, responsive dashboard for users to track their daily carbon footprint with gamification elements.", deadline: "2026-05-10", difficulty: "Medium", tags: ["Frontend", "Data Viz"] },
  { id: "s3", title: "Decentralized Voting System", description: "Design a secure, transparent voting system using smart contracts to prevent tampering and ensure anonymity.", deadline: "2026-05-20", difficulty: "Hard", tags: ["Web3", "Security"] },
  { id: "s4", title: "Local Food Rescuers", description: "A mobile-first web app connecting restaurants with surplus food to local shelters and food banks in real-time.", deadline: "2026-05-12", difficulty: "Easy", tags: ["Fullstack", "Mobile-First"] }
];

function StudentPortalContent({ problems, onSubmitProject, defaultEmail }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [submitFor, setSubmitFor] = useState(null);
  const [form, setForm] = useState({ name: "", email: defaultEmail, team: "", title: "", github: "", demo: "", ppt: "", description: "" });
  const [err, setErr] = useState("");

  const filtered = useMemo(() => {
    let base = problems;
    if (filter !== "All") base = base.filter(p => p.difficulty === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return base;
  }, [problems, search, filter]);

  const difficulties = ["All", ...Array.from(new Set(problems.map(p => p.difficulty)))];

  const handleOpen = (id) => {
    setSubmitFor(id);
    setErr("");
    setForm({ name: "", email: defaultEmail, team: "", title: "", github: "", demo: "", ppt: "", description: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.title || !form.github || !form.description) {
      setErr("Please fill all required fields.");
      return;
    }
    const problem = problems.find(p => p.id === submitFor);
    onSubmitProject({ ...form, category: problem ? problem.title : "Submission" });
    setSubmitFor(null);
  };

  return html`<div>
    <div className="card cardPad">
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="pill"><b>Filter</b> difficulty</div>
          <select className="input" style=${{ padding: "10px 12px" }} value=${filter} onChange=${(e) => setFilter(e.target.value)}>
            ${difficulties.map(d => html`<option value=${d}>${d}</option>`)}
          </select>
        </div>
        <div className="search" style=${{ width: "min(360px, 78vw)" }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style=${{ opacity: 0.8 }}><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
          <input value=${search} onInput=${(e) => setSearch(e.target.value)} placeholder="Search problems..." />
        </div>
      </div>

      <div className="problemGrid">
        ${filtered.map(p => html`<div className="card cardPad" style=${{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style=${{ fontWeight: 800, fontSize: 16 }}>${p.title}</div>
            <span className=${`badge ${p.difficulty === 'Hard' ? 'danger' : p.difficulty === 'Medium' ? 'warn' : 'success'}`}>${p.difficulty}</span>
          </div>
          <p style=${{ margin: 0, fontSize: 14, color: "var(--muted)", flex: 1, lineHeight: 1.5 }}>${p.description}</p>
          <div style=${{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            ${p.tags.map(t => html`<span className="chip">${t}</span>`)}
          </div>
          <div style=${{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style=${{ fontSize: 12, color: "var(--muted)" }}><b>Deadline</b>: ${p.deadline}</div>
            <button className="btn primary" onClick=${() => handleOpen(p.id)}>Submit Project</button>
          </div>
        </div>`)}
      </div>
    </div>

    ${submitFor ? html`<div className="modalOverlay">
      <div className="modalBox">
        <div className="modalHeader">
          <h2>Submit Project</h2>
          <button className="btn" style=${{ padding: "6px 8px" }} onClick=${() => setSubmitFor(null)}>✕</button>
        </div>
        <form onSubmit=${submit}>
          <div className="modalBody">
            ${err ? html`<div style=${{ color: "var(--danger)", fontSize: 13 }}>${err}</div>` : null}
            <div style=${{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Name *</div>
                <input className="input" value=${form.name} onInput=${(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Email *</div>
                <input className="input" type="email" value=${form.email} onInput=${(e) => setForm({...form, email: e.target.value})} disabled />
              </div>
            </div>
            <div style=${{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Team Name (Optional)</div>
                <input className="input" value=${form.team} onInput=${(e) => setForm({...form, team: e.target.value})} />
              </div>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Project Title *</div>
                <input className="input" value=${form.title} onInput=${(e) => setForm({...form, title: e.target.value})} />
              </div>
            </div>
            <div className="field" style=${{ marginTop: 0 }}>
              <div className="label">GitHub Repo Link *</div>
              <input className="input" value=${form.github} onInput=${(e) => setForm({...form, github: e.target.value})} />
            </div>
            <div style=${{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Live Demo Link (Optional)</div>
                <input className="input" value=${form.demo} onInput=${(e) => setForm({...form, demo: e.target.value})} />
              </div>
              <div className="field" style=${{ marginTop: 0 }}>
                <div className="label">Presentation / PPT Link (Optional)</div>
                <input className="input" value=${form.ppt} onInput=${(e) => setForm({...form, ppt: e.target.value})} />
              </div>
            </div>
            <div className="field" style=${{ marginTop: 0 }}>
              <div className="label">Abstract of Idea *</div>
              <textarea className="textarea" style=${{ minHeight: 80, resize: "vertical" }} value=${form.description} onInput=${(e) => setForm({...form, description: e.target.value})}></textarea>
            </div>
          </div>
          <div className="modalFooter">
            <button className="btn" type="button" onClick=${() => setSubmitFor(null)}>Cancel</button>
            <button className="btn primary" type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>` : null}
  </div>`;
}
