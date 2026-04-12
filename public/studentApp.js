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

function Icon({ name }) {
    const common = { className: "navIcon", viewBox: "0 0 24 24", fill: "none" };
    if (name === "dashboard") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM4 20h7v-5H4v5zM13 4h7v5h-7V4z" /></svg>`;
    }
    if (name === "projects") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
    }
    if (name === "schedule") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    }
    if (name === "leaderboard") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    }
    if (name === "messages") {
      return html`<svg ...${common} stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
    }
    return html`<span />`;
}

function StudentAuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(() => {
     const params = new URLSearchParams(window.location.hash.split('?')[1] || "");
     return !params.has('invite');
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState(() => {
     const params = new URLSearchParams(window.location.hash.split('?')[1] || "");
     return params.get('invite') || "";
  });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    
    if (isLogin) {
        if (!email.trim() || !password.trim()) return setErr("Please enter email and password.");
        try {
          const response = await fetch('/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password })
          });
          const data = await response.json();
          if (response.ok) onLogin({ email: email.trim(), team: data.user.team_name, room: data.user.room });
          else setErr(data.error || "Login failed.");
        } catch (error) { setErr("Failed to connect to the server."); }
    } else {
        if (!email.trim() || !password.trim() || !inviteCode.trim() || !fullName.trim()) return setErr("Please fill all fields.");
        try {
          const response = await fetch('/api/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password, invite_code: inviteCode.trim(), full_name: fullName.trim() })
          });
          const data = await response.json();
          if (response.ok) {
             const loginRes = await fetch('/api/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password })
             });
             const loginData = await loginRes.json();
             if (loginRes.ok) onLogin({ email: email.trim(), team: loginData.user.team_name, room: loginData.user.room });
             else { setIsLogin(true); setErr("Registration successful. Please login."); }
          }
          else setErr(data.error || "Signup failed.");
        } catch (error) { setErr("Failed to connect to the server."); }
    }
  };

  return html`<div className="loginWrap">
    <a href="#/" style=${{ position: "absolute", top: 20, left: 20, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to Home</a>
    <div className="card loginCard">
      <div className="loginHero">
        <div style=${{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brandLogo"></div>
          <div style=${{ display: "grid", gap: 2 }}>
            <div style=${{ fontWeight: 850 }}>Participant Portal</div>
            <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)" }}>Participant Dashboard</div>
          </div>
        </div>
        <h1 style=${{ marginTop: 18 }}>Submit and track your projects.</h1>
        <p>
          Welcome to the participant workspace. Here you can find your assigned room and volunteer, submit your project links, and watch the live leaderboard.
        </p>
        <div className="heroBox">
          <div style=${{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="pill">Project Submissions</span>
            <span className="pill">Live Leaderboard</span>
            <span className="pill">Event Schedule</span>
          </div>
          <div style=${{ marginTop: 10, fontSize: 12, color: "rgba(107,114,128,.95)" }}>
            Tip: Make sure your GitHub and demo links are completely public before submitting.
          </div>
        </div>
      </div>

      <form className="loginForm" onSubmit=${submit} style=${{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        <div className="tabs" style=${{ alignSelf: "flex-start", marginBottom: 16 }}>
           <div className=${`tab ${isLogin ? "active" : ""}`} onClick=${() => {setIsLogin(true); setErr("");}}>Login</div>
           <div className=${`tab ${!isLogin ? "active" : ""}`} onClick=${() => {setIsLogin(false); setErr("");}}>Sign Up</div>
        </div>

        <div style=${{ fontSize: 18, fontWeight: 800 }}>Participant ${isLogin ? 'Login' : 'Registration'}</div>
        <div style=${{ marginTop: 6, fontSize: 13, color: "rgba(107,114,128,.95)" }}>
          ${isLogin ? 'Log in with your existing account.' : 'Register securely using a team invite link.'}
        </div>

        ${!isLogin ? html`
        <div className="field" style=${{ marginTop: 24 }}>
          <div className="label">Team Invite Code</div>
          <input className="input" value=${inviteCode} onInput=${(e) => {
              let val = e.target.value;
              if (val.includes("invite=")) {
                  try { val = new URLSearchParams(val.split("?")[1]).get("invite") || val; } catch(err) {}
              }
              setInviteCode(val);
          }} type="text" placeholder="e.g. jx9a2k" required />
          <div style=${{fontSize: 11, color: "var(--muted)", marginTop: 4}}>Your team name will be mapped automatically.</div>
        </div>
        <div className="field">
          <div className="label">Full Name</div>
          <input className="input" value=${fullName} onInput=${(e) => setFullName(e.target.value)} type="text" placeholder="John Doe" required />
        </div>` : null}

        <div className="field" style=${{ marginTop: isLogin ? 24 : 0 }}>
          <div className="label">Participant Email</div>
          <input className="input" value=${email} onInput=${(e) => setEmail(e.target.value)} type="email" placeholder="Enter Email" required />
        </div>
        <div className="field">
          <div className="label">Password</div>
          <input className="input" value=${password} onInput=${(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
        </div>

        ${err ? html`<div style=${{ marginTop: 10, fontSize: 12, color: "rgba(185,28,28,.95)" }}>${err}</div>` : null}

        <button className="btn primary" style=${{ width: "100%", marginTop: 14, padding: "12px 14px" }} type="submit">
          ${isLogin ? 'Login → Portal' : 'Sign Up & Login'}
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

function StudentMessages({ announcements = [], defaultEmail }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  
  const submit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sender: defaultEmail })
      });
      setSent(true);
      setMsg("");
      setTimeout(() => setSent(false), 3000);
    } catch(err) { console.error(err); }
  };

  return html`<div>
    <div className="card cardPad" style=${{ marginBottom: 16 }}>
      <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Live Announcements</div>
      ${announcements.length === 0
        ? html`<div style=${{fontSize: 13, color: "var(--muted)"}}>No active announcements at this time.</div>`
        : announcements.map(a => html`
          <div className="pill" style=${{ background: a.type === 'warn' ? "rgba(239,68,68,.08)" : a.type === 'success' ? "rgba(22,163,74,.08)" : "rgba(109,76,255,.06)", borderColor: a.type === 'warn' ? "rgba(239,68,68,.2)" : a.type === 'success' ? "rgba(22,163,74,.2)" : "rgba(109,76,255,.15)", display: "block", marginBottom: 8 }}>
            <b>System:</b> ${a.message}
            <span style=${{float:'right', fontSize: 11, color: 'var(--muted)'}}>${new Date(a.created_at).toLocaleString()}</span>
          </div>`)}
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
  const [announcements, setAnnouncements] = useState([]);
  const [scheduleEvents, setScheduleEvents] = useState([]);

  useEffect(() => {
    saveStudentAuth(auth);
  }, [auth]);

  useEffect(() => {
    fetch('/api/announcements').then(r=>r.json()).then(setAnnouncements).catch(()=>{});
    fetch('/api/schedule').then(r=>r.json()).then(setScheduleEvents).catch(()=>{});
  }, []);

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
    if (!auth.email && !pathname.startsWith("/student/login") && !pathname.startsWith("/student/signup")) navTo("/student/login");
    if (auth.email && (pathname.startsWith("/student/login") || pathname.startsWith("/student/signup"))) navTo("/student/portal");
  }, [auth.email, pathname]);

  if (!auth.email) {
    return html`<${StudentAuthPage} onLogin=${onLogin} />`;
  }

  // Find own submissions automatically
  const mySubmissions = (systemStore.submissions || []).filter(s => s.members.includes(auth.email));

  const onSubmitProject = async (payload) => {
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
      room: auth.room || "Pending Admin Allotment",
      volunteer: null,
      submitted_by: auth.email
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit project to database');
      }

      setSystemStore(prev => ({ ...prev, submissions: [...(prev.submissions || []), newProject] }));
      setToast({ type: "success", title: "Project submitted!", message: "Your submission has been recorded." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", title: "Error submitting project", message: error.message });
    }
  };

  const navOps = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "projects", label: "Projects", icon: "projects" },
    { id: "schedule", label: "Schedule", icon: "schedule" },
    { id: "leaderboard", label: "Leaderboard", icon: "leaderboard" },
    { id: "messages", label: "Messages", icon: "messages" }
  ];

  const StudentSidebar = html`<aside className="sidebar">
      <div className="brandRow">
        <div className="brandLogo"></div>
        <div className="brandText" style=${{ display: "grid", gap: "2px" }}>
          <div className="brandTitle homeGradientText" style=${{fontSize: 16}}>Participant Portal</div>
          <div className="brandSub">Workspace</div>
        </div>
      </div>
      <div>
        <div className="navGroupTitle">Operations</div>
        <nav className="nav">
          ${navOps.map(it => html`<a className=${`navItem ${tab === it.id ? "active" : ""}`} href="#" onClick=${(e)=>{e.preventDefault(); setTab(it.id);}}><${Icon} name=${it.icon} /><span>${it.label}</span></a>`)}
        </nav>
      </div>
      <div className="sidebarFooter">
        <div className="pill" style=${{ flex: 1, minWidth: 0, overflow: 'hidden' }}><div className="avatar" style=${{ flexShrink: 0 }}></div><span style=${{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>${auth.full_name || auth.email}</span></div>
        <button className="btn danger" style=${{ padding: "6px 12px", flexShrink: 0 }} onClick=${onLogout}>Logout</button>
      </div>
    </aside>`;

  return html`<div className="appShell">
    ${StudentSidebar}
    <main className="main" style=${{ padding: "24px" }}>
      <div className="topbar" style=${{marginBottom: 24, padding: "0 0 16px 0", borderBottom: "1px solid var(--line)"}}>
        <div className="crumbs" style=${{ flex: 1 }}>
          <div style=${{ display: "grid", gap: "2px", minWidth: 0 }}>
            <div className="crumbTitle">Participant Workflow</div>
            <div className="crumbMeta">View problem statements and manage your projects</div>
          </div>
        </div>
        <div className="topActions">
          <div className="pill" style=${{background: "var(--bg)", borderColor: "var(--line)"}}>Participant Mode</div>
        </div>
      </div>
      <div className="content">
        ${tab === "dashboard" ? html`
          <div className="card cardPad" style=${{ marginBottom: 16 }}>
            <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Announcements</div>
            ${announcements.length === 0 ? html`<div style=${{fontSize: 13, color: "var(--muted)"}}>No active announcements.</div>` : announcements.map(a => html`
            <div className="pill" style=${{ background: a.type === 'warn' ? "rgba(239,68,68,.08)" : a.type === 'success' ? "rgba(22,163,74,.08)" : "var(--bg)", borderColor: a.type === 'warn' ? "rgba(239,68,68,.15)" : a.type === 'success' ? "rgba(22,163,74,.15)" : "var(--line)", display: "block", marginBottom: 8 }}>
                <b>System:</b> ${a.message}
            </div>`)}
          </div>
          <div className="card cardPad" style=${{ marginBottom: 16 }}>
            <div style=${{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Team & Event Information</div>
            <div style=${{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div className="card" style=${{ padding: 12, background: "rgba(109,76,255,.04)", border: "1px solid rgba(109,76,255,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Team Name</div>
                <div style=${{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>${auth.team || "Unassigned"}</div>
              </div>
              <div className="card" style=${{ padding: 12, background: "rgba(37,99,235,.04)", border: "1px solid rgba(37,99,235,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Current Round</div>
                <div style=${{ fontWeight: 800, fontSize: 15, marginTop: 4, color: "#2563eb" }}>${auth.round || "Round 1"}</div>
              </div>
              <div className="card" style=${{ padding: 12, background: "rgba(22,163,74,.04)", border: "1px solid rgba(22,163,74,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Assigned Room</div>
                <div style=${{ fontWeight: 800, fontSize: 15, marginTop: 4, color: "#16a34a" }}>${auth.room || "Pending"}</div>
              </div>
              <div className="card" style=${{ padding: 12, background: "rgba(109,76,255,.04)", border: "1px solid rgba(109,76,255,.12)", boxShadow: "none" }}>
                <div style=${{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Team Members</div>
                <div className="chips" style=${{ marginTop: 6 }}>
                  ${mySubmissions.length > 0 ? mySubmissions[0].members.filter(m => !m.includes('@')).map((m, i) => html`<span className="chip" style=${{ padding: "4px 8px", fontSize: 12, background: "rgba(255,255,255,.9)" }}><b>${i+1}.</b> ${m}</span>`) : html`<span className="chip" style=${{ padding: "4px 8px", fontSize: 12, background: "rgba(255,255,255,.9)" }}><b>1.</b> ${auth.full_name || auth.email.split('@')[0]} (You)</span>`}
                </div>
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
                <div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Room:</b> ${auth.room || "Pending Admin Allotment"}</div>
              </div>
            </div>`) : html`<div style=${{ color: "var(--muted)", fontSize: 13 }}>You haven't submitted any projects yet. Go to the Projects tab to make a submission.</div>`}
          </div>
        ` : tab === "projects" ? html`
          <${StudentPortalContent} problems=${PROBLEM_STATEMENTS} onSubmitProject=${onSubmitProject} defaultEmail=${auth.email} defaultTeam=${auth.team} />
        ` : tab === "schedule" ? html`
          <div className="card cardPad">
            <h3 style=${{marginBottom: 16}}>Event Schedule & Timeline</h3>
            ${scheduleEvents.length === 0 ? html`<p style=${{color: "var(--muted)", fontSize: 13}}>Schedule not posted yet.</p>` : 
              html`<div style=${{display: "flex", flexDirection: "column", gap: 16}}>
                 ${scheduleEvents.map(ev => html`
                   <div style=${{display: "flex", gap: 16, alignItems: "flex-start"}}>
                       <div style=${{minWidth: 80, fontWeight: 800, color: "var(--primary)", fontSize: 14, paddingTop: 2}}>${ev.time_start}</div>
                       <div style=${{flex: 1, paddingBottom: 16, borderBottom: "1px solid var(--line)"}}>
                           <div style=${{fontWeight: 700, fontSize: 15}}>${ev.title}</div>
                           <div style=${{fontSize: 13, color: "var(--muted)", marginTop: 4}}>${ev.description}</div>
                           ${ev.location ? html`<div style=${{fontSize: 12, marginTop: 6, fontWeight: 600}}>📍 ${ev.location}</div>` : null}
                       </div>
                   </div>
                 `)}
              </div>`
            }
          </div>
        ` : tab === "leaderboard" ? html`
          <${StudentLeaderboard} projects=${activeProjects} evaluations=${systemStore.evaluations || {}} />
        ` : html`
          <${StudentMessages} announcements=${announcements} defaultEmail=${auth.email} />
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

function StudentPortalContent({ problems, onSubmitProject, defaultEmail, defaultTeam }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [submitFor, setSubmitFor] = useState(null);
  const [form, setForm] = useState({ name: "", email: defaultEmail, team: defaultTeam, title: "", github: "", demo: "", ppt: "", description: "" });
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
    setForm({ name: "", email: defaultEmail, team: defaultTeam, title: "", github: "", demo: "", ppt: "", description: "" });
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
                <div className="label">Team Name *</div>
                <input className="input" value=${form.team} disabled title="Autofilled from your account" />
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
