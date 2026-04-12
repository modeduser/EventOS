import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import { StudentApp } from "./studentApp.js";
import { AdminApp } from "./adminApp.js";

const html = htm.bind(React.createElement);

const STORAGE_KEY = "review_portal_v1";

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    if (store && store.evaluations) {
      for (const pId in store.evaluations) {
        if (store.evaluations[pId] && store.evaluations[pId].scores) {
          const oldEval = store.evaluations[pId];
          store.evaluations[pId] = { "system": oldEval };
        }
      }
    }
    return store;
  } catch {
    return null;
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function defaultStore() {
  return {
    auth: { email: "" },
    evaluations: {}, // projectId -> { scores, feedback, draftUpdatedAt, submittedAt }
    ui: { blindMode: false },
    submissions: [],
  };
}

const PROJECTS = [
  {
    id: "p1",
    name: "Adrian Bert — CRM Dashboard",
    team: "Keitoto Studio",
    category: "SaaS",
    description:
      "A CRM dashboard that helps sales teams track leads, pipeline stages, and outreach performance with role-based access and analytics.",
    members: ["Aarav", "Maya", "Sofia", "Rohan"],
    links: {
      github: "https://github.com/example/crm-dashboard",
      ppt: "https://example.com/crm-deck",
      demo: "https://example.com/crm-demo",
    },
    room: "Room 101",
    volunteer: { name: "Alice Johnson", contact: "+1 (555) 123-4567" },
  },
  {
    id: "p2",
    name: "Trust — SaaS Dashboard",
    team: "North Star",
    category: "SaaS",
    description:
      "A secure admin portal focused on auditability, granular permissions, and a delightful dashboard experience for operations teams.",
    members: ["Isha", "Noah", "Liam"],
    links: {
      github: "https://github.com/example/trust-saas",
      ppt: "https://example.com/trust-deck",
      demo: "https://example.com/trust-demo",
    },
    room: "Room 102",
    volunteer: { name: "Bob Smith", contact: "+1 (555) 987-6543" },
  },
  {
    id: "p3",
    name: "Pertamina Project",
    team: "Blue Circuit",
    category: "Energy",
    description:
      "A planning tool for field operations to report maintenance status and track safety checks with offline-first syncing.",
    members: ["Zara", "Kabir", "Olivia"],
    links: {
      github: "https://github.com/example/pertamina",
      ppt: "https://example.com/pertamina-deck",
      demo: "https://example.com/pertamina-demo",
    },
    room: "Room 205",
    volunteer: { name: "Charlie Davis", contact: "+1 (555) 456-7890" },
  },
  {
    id: "p4",
    name: "Garuda Project",
    team: "SkyWorks",
    category: "Travel",
    description:
      "A travel experience platform that bundles itinerary planning, local discovery, and smart budgeting into one interface.",
    members: ["Ethan", "Aanya", "Lucas", "Meera"],
    links: {
      github: "https://github.com/example/garuda",
      ppt: "https://example.com/garuda-deck",
      demo: "https://example.com/garuda-demo",
    },
    room: "Room 304",
    volunteer: { name: "Diana Prince", contact: "+1 (555) 321-0987" },
  },
];

const PROBLEM_STATEMENTS = [
  {
    id: "s1",
    title: "AI Customer Support Agent",
    description: "Build an intelligent chatbot that can resolve 80% of tier-1 support tickets using LLMs and an internal knowledge base.",
    deadline: "2026-05-15",
    difficulty: "Hard",
    tags: ["AI/ML", "Backend"],
  },
  {
    id: "s2",
    title: "Eco-Tracker Dashboard",
    description: "Create a beautiful, responsive dashboard for users to track their daily carbon footprint with gamification elements.",
    deadline: "2026-05-10",
    difficulty: "Medium",
    tags: ["Frontend", "Data Viz"],
  },
  {
    id: "s3",
    title: "Decentralized Voting System",
    description: "Design a secure, transparent voting system using smart contracts to prevent tampering and ensure anonymity.",
    deadline: "2026-05-20",
    difficulty: "Hard",
    tags: ["Web3", "Security"],
  },
  {
    id: "s4",
    title: "Local Food Rescuers",
    description: "A mobile-first web app connecting restaurants with surplus food to local shelters and food banks in real-time.",
    deadline: "2026-05-12",
    difficulty: "Easy",
    tags: ["Fullstack", "Mobile-First"],
  }
];

function clampScore(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 1;
  return Math.max(1, Math.min(10, Math.round(x)));
}

function nowIso() {
  return new Date().toISOString();
}

function routeFromHash() {
  const h = window.location.hash || "#/";
  const path = h.replace(/^#/, "");
  const [pathname, qs] = path.split("?");
  const query = new URLSearchParams(qs || "");
  return { pathname, query };
}

function navTo(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

function Icon({ name }) {
  const common = { className: "navIcon", viewBox: "0 0 24 24", fill: "none" };
  if (name === "dashboard") {
    return html`<svg ...${common} stroke="currentColor" strokeWidth="2">
      <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM4 20h7v-5H4v5zM13 4h7v5h-7V4z" />
    </svg>`;
  }
  if (name === "review") {
    return html`<svg ...${common} stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h10M4 18h16" />
      <path d="M18 9l2 2-6 6H12v-2l6-6z" />
    </svg>`;
  }
  if (name === "leaderboard") {
    return html`<svg ...${common} stroke="currentColor" strokeWidth="2">
      <path d="M8 21V10M16 21V3M12 21v-6" />
      <path d="M4 21h16" />
    </svg>`;
  }
  if (name === "logout") {
    return html`<svg ...${common} stroke="currentColor" strokeWidth="2">
      <path d="M10 17l1 1 7-7-7-7-1 1 6 6-6 6z" />
      <path d="M4 12h12" />
    </svg>`;
  }
  if (name === "search") {
    return html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style=${{ opacity: 0.8 }}>
      <circle cx="11" cy="11" r="7"></circle>
      <path d="M20 20l-3.5-3.5"></path>
    </svg>`;
  }
  if (name === "student") {
    return html`<svg ...${common} stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>`;
  }
  return html`<span />`;
}

function useHashRoute() {
  const [route, setRoute] = useState(routeFromHash());
  useEffect(() => {
    const onChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function useStore() {
  const [store, setStore] = useState(() => loadStore() || defaultStore());
  const setAndPersist = (updater) => {
    setStore((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStore(next);
      return next;
    });
  };
  return [store, setAndPersist];
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

function Sidebar({ routePath, email, onLogout }) {
  const nav = [
    { path: "/judge/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/judge/review", label: "Review workspace", icon: "review" },
    { path: "/judge/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  ];
  return html`<aside className="sidebar">
    <div className="brandRow">
      <div className="brandLogo"></div>
      <div className="brandText" style=${{ display: "grid", gap: "2px" }}>
        <div className="brandTitle homeGradientText" style=${{fontSize: 16}}>Judge Portal</div>
        <div className="brandSub">Judge workspace</div>
      </div>
    </div>

    <div>
      <div className="navGroupTitle">Navigation</div>
      <nav className="nav">
        ${nav.map(
          (it) => html`<a
            className=${`navItem ${routePath === it.path ? "active" : ""}`}
            href=${`#${it.path}`}
          >
            <${Icon} name=${it.icon} />
            <span>${it.label}</span>
          </a>`
        )}
      </nav>
    </div>

    <div className="sidebarFooter">
      <div className="pill" style=${{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div className="avatar" style=${{ flexShrink: 0 }}></div>
        <span style=${{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >${email || "Guest"}</span
        >
      </div>
      <button className="btn danger" style=${{ padding: "6px 12px", flexShrink: 0 }} onClick=${onLogout} title="Logout">
        <${Icon} name="logout" />
      </button>
    </div>
  </aside>`;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const bg =
    toast.type === "success"
      ? "rgba(22,163,74,.12)"
      : toast.type === "danger"
      ? "rgba(239,68,68,.12)"
      : "rgba(109,76,255,.10)";
  const border =
    toast.type === "success"
      ? "rgba(22,163,74,.22)"
      : toast.type === "danger"
      ? "rgba(239,68,68,.22)"
      : "rgba(109,76,255,.18)";
  return html`<div
    style=${{
      position: "fixed",
      right: 16,
      bottom: 16,
      zIndex: 999,
      width: "min(420px, calc(100vw - 32px))",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 14,
      padding: 12,
      boxShadow: "0 16px 40px rgba(17,24,39,.14)",
      backdropFilter: "blur(10px)",
    }}
  >
    <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style=${{ fontWeight: 750 }}>${toast.title}</div>
      <button className="btn" style=${{ padding: "8px 10px" }} onClick=${onClose}>Close</button>
    </div>
    ${toast.message
      ? html`<div style=${{ marginTop: 6, color: "rgba(17,24,39,.82)", fontSize: 13, lineHeight: 1.4 }}>
          ${toast.message}
        </div>`
      : null}
  </div>`;
}

function LoginPage({ onLogin, type }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password.trim()) {
      setErr("Please enter email and password.");
      return;
    }
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      
      if (response.ok) {
        if (data.user.role !== 'judge' && data.user.role !== 'admin') {
           setErr("Access denied. You do not have portal privileges.");
        } else {
           onLogin({ email: email.trim(), role: data.user.role });
        }
      } else {
        setErr(data.error || "Login failed.");
      }
    } catch (error) {
      setErr("Failed to connect to the server.");
    }
  };

  return html`<div className="loginWrap">
    <a href="#/" style=${{ position: "absolute", top: 20, left: 20, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to Home</a>
    <div className="card loginCard">
      <div className="loginHero">
        <div style=${{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="brandLogo"></div>
          <div style=${{ display: "grid", gap: 2 }}>
            <div style=${{ fontWeight: 850 }}>Staff Portal</div>
            <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)" }}>Login to the designated workspace</div>
          </div>
        </div>
        <h1 style=${{ marginTop: 18 }}>One workspace. Everything on one screen.</h1>
        <p>
          Secure system for Admins and Judges. Manage users, oversee submissions, build teams, and submit scores natively.
        </p>
        <div className="heroBox">
          <div style=${{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="pill">Project Evaluations</span>
            <span className="pill">Live Statistics</span>
            <span className="pill">Team Organization</span>
          </div>
          <div style=${{ marginTop: 10, fontSize: 12, color: "rgba(107,114,128,.95)" }}>
            Tip: Use desktop web browsers for the preferred grading and scheduling experience.
          </div>
        </div>
      </div>

      <form className="loginForm" onSubmit=${submit}>
        <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style=${{ fontSize: 14, fontWeight: 800 }}>Login</div>
        </div>

        <div className="field" style=${{marginTop: 16}}>
          <div className="label">Email</div>
          <input
            className="input"
            value=${email}
            onInput=${(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            type="email"
            autoComplete="email"
          />
        </div>
        <div className="field">
          <div className="label">Password</div>
          <input
            className="input"
            value=${password}
            onInput=${(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        ${err
          ? html`<div style=${{ marginTop: 10, fontSize: 12, color: "rgba(185,28,28,.95)" }}>${err}</div>`
          : null}

        <button className="btn primary" style=${{ width: "100%", marginTop: 14, padding: "12px 14px" }} type="submit">
          Login → Dashboard
        </button>
      </form>
    </div>
  </div>`;
}

function DashboardPage({ projects, evaluations, email }) {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
     fetch('/api/announcements').then(r=>r.json()).then(setAnnouncements).catch(()=>{});
  }, []);

  const total = projects.length;
  const reviewed = projects.filter((p) => evaluations[p.id]?.[email]?.submittedAt).length;
  const pending = total - reviewed;
  const progressPct = total === 0 ? 0 : Math.round((reviewed / total) * 100);

  return html`<div className="content">
    <div className="grid3">
      <div className="stat">
        <div className="statLabel">Total assigned projects</div>
        <div className="statValue">${total}</div>
        <div className="statHint">Projects in your queue</div>
      </div>
      <div className="stat">
        <div className="statLabel">Pending reviews</div>
        <div className="statValue">${pending}</div>
        <div className="statHint">Not submitted yet</div>
      </div>
      <div className="stat">
        <div className="statLabel">Completed reviews</div>
        <div className="statValue">${reviewed}</div>
        <div className="statHint">Submitted evaluations</div>
      </div>
    </div>

    <div className="card cardPad" style=${{ marginTop: 12 }}>
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style=${{ fontWeight: 850 }}>Progress</div>
          <div style=${{ marginTop: 4, fontSize: 12, color: "rgba(107,114,128,.95)" }}>
            ${reviewed}/${total} reviewed (${progressPct}%)
          </div>
        </div>
        <a className="btn primary" href="#/review">
          Start Reviewing
        </a>
      </div>

      <div style=${{ marginTop: 12 }}>
        <div className="progressBar">
          <div style=${{ width: `${progressPct}%` }}></div>
        </div>
      </div>
    </div>

    <div className="card cardPad" style=${{ marginTop: 12 }}>
      <div style=${{ fontWeight: 850, marginBottom: 12 }}>Live Event Feed</div>
      <div style=${{ display: "flex", flexDirection: "column", gap: 10 }}>
        ${announcements.length === 0 ? html`<div style=${{fontSize: 13, color: "var(--muted)"}}>No active announcements.</div>` : announcements.map(a => html`
        <div className="pill" style=${{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", borderColor: "var(--line)" }}>
          <span style=${{ width: 8, height: 8, borderRadius: "50%", background: a.type === 'warn' ? "var(--warn)" : a.type === 'success' ? "var(--success)" : "var(--primary)" }}></span>
          <span><b>System:</b> ${a.message}</span>
          <span style=${{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>${new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        `)}
      </div>
    </div>
  </div>`;
}

function ScoreSlider({ label, value, onChange }) {
  return html`<div className="scoreItem">
    <div className="scoreTop">
      <div className="scoreLabel">${label}</div>
      <div className="scoreValue">${value}</div>
    </div>
    <input
      className="range"
      type="range"
      min="1"
      max="10"
      step="1"
      value=${value}
      onInput=${(e) => onChange(clampScore(e.target.value))}
    />
  </div>`;
}

function ReviewWorkspacePage({
  projects,
  evaluations,
  onSaveDraft,
  onSubmit,
  ui,
  onToggleBlindMode,
  setToast,
  email,
}) {
  const [selectedId, setSelectedId] = useState(() => {
    const firstPending = projects.find((p) => !evaluations[p.id]?.[email]?.submittedAt);
    return (firstPending || projects[0] || {}).id || "";
  });
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Assigned");

  useEffect(() => {
    if (!selectedId && projects[0]) setSelectedId(projects[0].id);
  }, [selectedId, projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = projects.filter((p) => {
      const submitted = !!evaluations[p.id]?.[email]?.submittedAt;
      if (tab === "Pending" && submitted) return false;
      if (tab === "Reviewed" && !submitted) return false;
      return true;
    });
    if (!q) return base;
    return base.filter((p) => `${p.name} ${p.team}`.toLowerCase().includes(q));
  }, [projects, evaluations, search, tab, email]);

  const selected = projects.find((p) => p.id === selectedId) || projects[0];
  const evalEntry = selected ? evaluations[selected.id]?.[email] : null;

  const effectiveScores = (evalEntry && evalEntry.scores) || {
    innovation: 7,
    technical: 7,
    design: 7,
    impact: 7,
    pitching: 7,
  };
  const [scores, setScores] = useState(effectiveScores);
  const [feedback, setFeedback] = useState((evalEntry && evalEntry.feedback) || "");
  const [privateNotes, setPrivateNotes] = useState((evalEntry && evalEntry.privateNotes) || "");

  const hydrateFromSelection = useRef({ id: null });
  useEffect(() => {
    if (!selected) return;
    if (hydrateFromSelection.current.id === selected.id) return;
    hydrateFromSelection.current.id = selected.id;
    const entry = evaluations[selected.id]?.[email];
    setScores(
      (entry && entry.scores) || { innovation: 7, technical: 7, design: 7, impact: 7, pitching: 7 }
    );
    setFeedback((entry && entry.feedback) || "");
    setPrivateNotes((entry && entry.privateNotes) || "");
  }, [selected, evaluations, email]);

  const autosave = (nextScores, nextFeedback, nextPrivateNotes) => {
    if (!selected) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      onSaveDraft(selected.id, { scores: nextScores, feedback: nextFeedback, privateNotes: nextPrivateNotes }, { silent: true });
    }, 350);
  };



  const reviewedCount = projects.filter((p) => !!evaluations[p.id]?.[email]?.submittedAt).length;
  const total = projects.length;

  const submit = () => {
    if (!selected) return;
    onSubmit(selected.id, { scores, feedback, privateNotes });
    const nextPending = projects.find((p) => p.id !== selected.id && !evaluations[p.id]?.[email]?.submittedAt);
    if (nextPending) {
      setSelectedId(nextPending.id);
      setToast({ type: "success", title: "Submitted", message: "Evaluation submitted. Moving to next project." });
    } else {
      setToast({ type: "success", title: "All done", message: "You’ve reviewed every assigned project." });
    }
  };

  const isSubmitted = !!(selected && evaluations[selected.id]?.[email]?.submittedAt);
  const totalScore = Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);

  return html`<div className="content" style=${{ paddingTop: 12 }}>
    <div className="reviewShell">
      <div className="card panel">
        <div className="panelHeader">
          <div style=${{ display: "grid" }}>
            <div className="panelTitle">Projects</div>
            <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)" }}>${reviewedCount}/${total} reviewed by you</div>
          </div>
          <div className="tabs" title="Filter projects">
            ${["Assigned", "Pending", "Reviewed"].map(
              (t) => html`<div className=${`tab ${tab === t ? "active" : ""}`} onClick=${() => setTab(t)}>${t}</div>`
            )}
          </div>
        </div>
        <div className="panelBody">
          <div className="search" style=${{ width: "100%", marginBottom: 10 }}>
            <${Icon} name="search" />
            <input value=${search} onInput=${(e) => setSearch(e.target.value)} placeholder="Search project..." />
          </div>
          <div className="projectList">
            ${filtered.map((p) => {
              const submitted = !!evaluations[p.id]?.[email]?.submittedAt;
              return html`<div
                className=${`projectRow ${p.id === selectedId ? "active" : ""}`}
                onClick=${() => setSelectedId(p.id)}
              >
                <div className="rowTop">
                  <div className="rowName">${p.name}</div>
                  <span className=${`badge ${submitted ? "reviewed" : "pending"}`}>${submitted ? "Reviewed" : "Pending"}</span>
                </div>
                <div className="rowMeta">
                  <span>${ui.blindMode ? "Team hidden" : p.team}</span>
                  <span className="dot"></span>
                  <span>${p.category}</span>
                </div>
              </div>`;
            })}
          </div>
        </div>
      </div>

      <div className="card panel">
        <div className="panelHeader">
          <div className="panelTitle">Project details</div>
          <button className="btn" onClick=${onToggleBlindMode} title="Hide team names for blind judging">
            ${ui.blindMode ? "Blind mode: ON" : "Blind mode: OFF"}
          </button>
        </div>
        <div className="panelBody">
          ${!selected
            ? html`<div style=${{ color: "rgba(107,114,128,.95)" }}>No project selected.</div>`
            : html`<div className="kv">
                <div>
                  <h2>${selected.name}</h2>
                  <p style=${{ marginTop: 8 }}>${selected.description}</p>
                </div>

                <div className="card" style=${{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,.72)" }}>
                  <div style=${{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                    <div className="pill"><b>Team</b> ${ui.blindMode ? "Hidden" : selected.team}</div>
                    <div className="pill"><b>Category</b> ${selected.category}</div>
                    <div className=${`pill`}><b>Status</b> ${isSubmitted ? "Reviewed" : "Pending"}</div>
                  </div>
                  <div style=${{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Room:</b> ${selected.room || "Pending Admin Allotment"}</div>
                    ${selected.volunteer ? html`<div className="pill" style=${{ background: "var(--bg)", borderColor: "var(--line)" }}><b>Volunteer:</b> ${selected.volunteer.name} (${selected.volunteer.contact})</div>` : ""}
                  </div>
                </div>

                <div>
                  <div style=${{ fontWeight: 800, marginBottom: 8 }}>Team members</div>
                  <div className="chips">
                    ${(ui.blindMode ? ["Hidden"] : selected.members).map((m) => html`<span className="chip">${m}</span>`)}
                  </div>
                </div>

                <div>
                  <div style=${{ fontWeight: 800, marginBottom: 8 }}>Links</div>
                  <div className="links">
                    <div className="linkRow">
                      <span>GitHub</span>
                      <a href=${selected.links.github} target="_blank" rel="noreferrer">Open</a>
                    </div>
                    <div className="linkRow">
                      <span>PPT / Deck</span>
                      <a href=${selected.links.ppt} target="_blank" rel="noreferrer">Open</a>
                    </div>
                    <div className="linkRow">
                      <span>Demo video</span>
                      <a href=${selected.links.demo} target="_blank" rel="noreferrer">Open</a>
                    </div>
                  </div>
                </div>
              </div>`}
        </div>
      </div>

      <div className="card panel evalPanel" style=${{ position: "sticky", top: 76, height: "fit-content", alignSelf: "start" }}>
        <div className="panelHeader">
          <div style=${{ display: "grid" }}>
            <div className="panelTitle">Evaluation</div>
            <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)" }}>Total score: <b>${totalScore}</b>/50</div>
          </div>
          <span className=${`badge ${isSubmitted ? "reviewed" : "pending"}`}>${isSubmitted ? "Submitted" : "Draft"}</span>
        </div>
        <div className="panelBody">
          <div className="scoreGrid">
            <${ScoreSlider}
              label="Innovation"
              value=${scores.innovation}
              onChange=${(v) => {
                const next = { ...scores, innovation: v };
                setScores(next);
                autosave(next, feedback);
              }}
            />
            <${ScoreSlider}
              label="Technical Skills"
              value=${scores.technical}
              onChange=${(v) => {
                const next = { ...scores, technical: v };
                setScores(next);
                autosave(next, feedback);
              }}
            />
            <${ScoreSlider}
              label="Design"
              value=${scores.design}
              onChange=${(v) => {
                const next = { ...scores, design: v };
                setScores(next);
                autosave(next, feedback);
              }}
            />
            <${ScoreSlider}
              label="Impact"
              value=${scores.impact}
              onChange=${(v) => {
                const next = { ...scores, impact: v };
                setScores(next);
                autosave(next, feedback);
              }}
            />
            <${ScoreSlider}
              label="Pitching / Presentation"
              value=${scores.pitching}
              onChange=${(v) => {
                const next = { ...scores, pitching: v };
                setScores(next);
                autosave(next, feedback);
              }}
            />

            <div>
              <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)", fontWeight: 700, marginBottom: 8 }}>
                Feedback
              </div>
              <textarea
                className="textarea"
                value=${feedback}
                placeholder="Write actionable feedback..."
                onInput=${(e) => {
                  const nextFb = e.target.value;
                  setFeedback(nextFb);
                  autosave(scores, nextFb, privateNotes);
                }}
              ></textarea>
            </div>

            <div style=${{ marginTop: 12 }}>
              <div style=${{ fontSize: 12, color: "rgba(107,114,128,.95)", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                Judge Private Notes <span className="chip" style=${{ padding: "2px 6px", fontSize: 10, background: "rgba(239,68,68,.1)", color: "rgba(239,68,68,.9)" }}>Hidden from students</span>
              </div>
              <textarea
                className="textarea"
                value=${privateNotes}
                placeholder="Jot down personal notes (not shared with anyone)..."
                onInput=${(e) => {
                  const nextPn = e.target.value;
                  setPrivateNotes(nextPn);
                  autosave(scores, feedback, nextPn);
                }}
              ></textarea>
            </div>

            <div className="btnRow">
              <button
                className="btn"
                onClick=${() => {
                  if (!selected) return;
                  onSaveDraft(selected.id, { scores, feedback, privateNotes }, { silent: false });
                  setToast({ type: "success", title: "Draft saved", message: "Your draft is stored locally." });
                }}
              >
                Save Draft
              </button>
              <button className="btn primary" onClick=${submit}>
                Submit Evaluation
              </button>
            </div>

            <div className="smallNote">
              <b>Shortcuts:</b> J/K to switch projects · S to save draft. Drafts auto-save while you type.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function LeaderboardPage({ projects, evaluations }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

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
        judgeCount,
        avgTotal,
      };
    });
    const filtered = base.filter((r) => (category === "All" ? true : r.category === category));
    const q = search.trim().toLowerCase();
    const filtered2 = q ? filtered.filter((r) => `${r.name} ${r.team}`.toLowerCase().includes(q)) : filtered;
    return filtered2.sort((a, b) => b.avgTotal - a.avgTotal);
  }, [projects, evaluations, category, search]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);

  const exportCSV = () => {
    const headers = ["Rank", "Project", "Team", "Category", "Avg Score", "Judges"];
    const csvRows = [headers.join(",")];
    rows.forEach((r, idx) => {
      csvRows.push([
        idx + 1,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.team.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        r.avgTotal,
        r.judgeCount
      ].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'leaderboard.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return html`<div className="content">
    <div className="card cardPad">
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="pill"><b>Rank</b> total score</div>
          <select className="input" style=${{ padding: "10px 12px", width: 190 }} value=${category} onChange=${(e) => setCategory(e.target.value)}>
            ${categories.map((c) => html`<option value=${c}>${c}</option>`)}
          </select>
          <button className="btn" onClick=${exportCSV} style=${{ padding: "10px 12px" }}>
            Export CSV
          </button>
        </div>
        <div className="search" style=${{ width: "min(360px, 78vw)" }}>
          <${Icon} name="search" />
          <input value=${search} onInput=${(e) => setSearch(e.target.value)} placeholder="Search projects..." />
        </div>
      </div>

      <div style=${{ marginTop: 12, overflow: "auto", borderRadius: 14, border: "1px solid var(--line)" }}>
        <table className="table">
          <thead>
            <tr>
              <th style=${{ width: 64 }}>Rank</th>
              <th>Project</th>
              <th>Team</th>
              <th>Category</th>
              <th className="right" style=${{ width: 140 }}>Score Avg</th>
              <th style=${{ width: 100, textAlign: "center" }}>Judges</th>
              <th style=${{ width: 140 }}>Status</th>
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
                <td style=${{ textAlign: "center" }}>
                  <span className="badge" style=${{ background: "var(--line)" }}>${r.judgeCount}</span>
                </td>
                <td><span className=${`badge ${r.judgeCount > 0 ? "reviewed" : "pending"}`}>${r.judgeCount > 0 ? "Reviewed" : "Pending"}</span></td>
              </tr>`;
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function HomePage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = [
    { q: "How do I register as a participant?", a: "Click 'Participant Portal' and use the invite link provided by your event organizer to sign up." },
    { q: "How does judging work?", a: "Judges log in via the Judge Portal, review assigned projects, and score them across categories like Innovation, Execution, and Impact." },
    { q: "Can I edit my submission after submitting?", a: "Contact your event organizer via the Messages tab in your Participant Portal to request changes." },
    { q: "How are rooms assigned?", a: "Admins assign rooms via the Team List module. Your room number will appear automatically on your dashboard once assigned." },
    { q: "When will results be announced?", a: "Results are announced at the Closing Ceremony. You can check the Live Leaderboard in your portal for real-time rankings." },
  ];

  return html`<div className="homeWrap">
    <header className="homeHeader">
      <div className="homeLogo">
        <div className="brandLogo" style=${{width:28,height:28}}></div>
        <span style=${{fontWeight:800,fontSize:16,letterSpacing:'-0.5px'}}>EventOS</span>
      </div>
    </header>

    <section className="homeHero">
      <div className="homeBadge">Hackathon Management Platform</div>
      <h1 className="homeTitle">Run your hackathon<br/>like a <span className="homeGradientText">pro</span>.</h1>
      <p className="homeDesc">EventOS gives organizers, students, and judges a unified hub to manage teams, submissions, schedules, and live scoring — all in real time.</p>
      <div className="homeCtaGroup row-mobile">
        <button className="homeCta student" onClick=${() => navTo("/student/login")}>
          <span>Participant Portal</span><span className="homeCtaArrow">→</span>
        </button>
        <button className="homeCta judge" onClick=${() => navTo("/judge/login")}>
          <span>Judge Portal</span><span className="homeCtaArrow">→</span>
        </button>
        <button className="homeCta admin" onClick=${() => navTo("/admin/dashboard")}>
          <span>Admin Portal</span><span className="homeCtaArrow">→</span>
        </button>
      </div>
    </section>

    <section className="homeFeatures">
      <div className="homeSection">
        <h2 className="homeSectionTitle">Everything you need, in one place</h2>
        <p className="homeSectionSub">Purpose-built for hackathon organisers, participants, and evaluators.</p>
        <div className="featuresGrid">
          ${[
            {icon:'🏆',title:'Live Leaderboard',desc:'Real-time rankings computed from judge scores across all teams.'},
            {icon:'📢',title:'Global Announcements',desc:'Broadcast instant updates to all portals simultaneously.'},
            {icon:'📅',title:'Event Schedule',desc:'A full two-day hackathon timeline with times and locations.'},
            {icon:'👥',title:'Team Management',desc:'Issue invite links, assign rooms, and track rounds.'},
            {icon:'📋',title:'Blind Judging',desc:'Judges evaluate projects without seeing team identities.'},
            {icon:'🔒',title:'Secure Auth',desc:'Role-based access for students, judges, and admins.'},
          ].map(f => html`
          <div className="featureCard">
            <div className="featureIcon">${f.icon}</div>
            <div className="featureTitle">${f.title}</div>
            <div className="featureDesc">${f.desc}</div>
          </div>`)}
        </div>
      </div>
    </section>

    <section className="homeFAQ">
      <div className="homeSection">
        <h2 className="homeSectionTitle">Frequently Asked Questions</h2>
        <div className="faqList">
          ${faqs.map((f, i) => html`
          <div className="faqItem" onClick=${() => setFaqOpen(faqOpen === i ? null : i)}>
            <div className="faqQ">${f.q}<span className="faqChevron">${faqOpen === i ? '▲' : '▼'}</span></div>
            ${faqOpen === i ? html`<div className="faqA">${f.a}</div>` : null}
          </div>`)}
        </div>
      </div>
    </section>

    <footer className="homeFooter">
      <div style=${{display:'flex',alignItems:'center',gap:10}}>
        <div className="brandLogo" style=${{width:22,height:22}}></div>
        <span style=${{fontWeight:700}}>EventOS</span>
      </div>
      <div style=${{fontSize:12,color:'var(--muted)',textAlign:'center'}}>Built with purpose. © ${new Date().getFullYear()} EventOS. All rights reserved.</div>
      <div style=${{display:'flex',gap:16}}>
        <button className="homeNavBtn text" style=${{fontSize:12,padding:'4px 10px'}} onClick=${() => navTo("/student/login")}>Participant</button>
        <button className="homeNavBtn text" style=${{fontSize:12,padding:'4px 10px'}} onClick=${() => navTo("/judge/login")}>Judge</button>
        <button className="homeNavBtn text" style=${{fontSize:12,padding:'4px 10px'}} onClick=${() => navTo("/admin/dashboard")}>Admin</button>
      </div>
    </footer>
  </div>`;
}

function App() {
  const route = useHashRoute();
  const [store, setStore] = useStore();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const pathname = route.pathname || "/";

  const activeProjects = useMemo(() => {
    // we need PROJECTS reference here
    return typeof PROJECTS !== 'undefined' ? [...PROJECTS, ...(store.submissions || [])] : (store.submissions || []);
  }, [store.submissions]);

  const authed = !!store.auth.email;

  useEffect(() => {
    if (pathname !== "/" && !pathname.startsWith("/student")) {
      if (!authed && pathname !== "/judge/login") navTo("/judge/login");
      if (authed && pathname === "/judge/login") {
         if (store.auth?.role === 'admin') navTo("/admin/dashboard");
         else navTo("/judge/dashboard");
      }
    }
  }, [authed, pathname, store.auth?.role]);

  if (pathname === "/") {
    return html`<div style=${{ minHeight: "100vh", position: "relative" }}><${HomePage} /></div>`;
  }

  if (pathname.startsWith("/student")) {
    return html`<div style=${{ minHeight: "100vh", position: "relative" }}>
      <${StudentApp} systemStore=${store} activeProjects=${activeProjects} setSystemStore=${setStore} route=${route} setToast=${setToast} />
      <${Toast} toast=${toast} onClose=${() => setToast(null)} />
    </div>`;
  }

  if (pathname.startsWith("/admin")) {
    return html`<div style=${{ minHeight: "100vh", position: "relative" }}>
      <${AdminApp} systemStore=${store} setSystemStore=${setStore} route=${route} setToast=${setToast} />
      <${Toast} toast=${toast} onClose=${() => setToast(null)} />
    </div>`;
  }

  const onLogin = ({ email, role }) => {
    setStore((prev) => ({ ...prev, auth: { email, role } }));
    if (role === 'admin') navTo("/admin/dashboard");
    else navTo("/judge/dashboard");
  };
  const onLogout = () => {
    setStore((prev) => ({ ...prev, auth: { email: "" } }));
    navTo("/judge/login");
  };

  const onSaveDraft = (projectId, payload, { silent }) => {
    setStore((prev) => {
      const email = prev.auth.email;
      const projectEvals = prev.evaluations[projectId] || {};
      const current = projectEvals[email] || {};
      const next = {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [projectId]: {
            ...projectEvals,
            [email]: {
              ...current,
              scores: payload.scores,
              feedback: payload.feedback,
              privateNotes: payload.privateNotes,
              draftUpdatedAt: nowIso(),
            },
          },
        },
      };
      return next;
    });
    if (!silent) {
      setToast({ type: "success", title: "Draft saved", message: "Saved locally in this browser." });
    }
  };

  const onSubmit = async (projectId, payload) => {
    const email = store.auth.email;
    const total_score = Object.values(payload.scores).reduce((a, b) => a + Number(b || 0), 0);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          judge_email: email,
          scores: payload.scores,
          feedback: payload.feedback,
          total_score: total_score
        })
      });
      if (!response.ok) {
        throw new Error('Failed to submit evaluation to database.');
      }
    } catch (error) {
      console.error(error);
      setToast({ type: "error", title: "DB Error", message: error.message });
    }

    setStore((prev) => {
      const email = prev.auth.email;
      const projectEvals = prev.evaluations[projectId] || {};
      const current = projectEvals[email] || {};
      const next = {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [projectId]: {
            ...projectEvals,
            [email]: {
              ...current,
              scores: payload.scores,
              feedback: payload.feedback,
              privateNotes: payload.privateNotes,
              draftUpdatedAt: current.draftUpdatedAt || nowIso(),
              submittedAt: nowIso(),
            },
          },
        },
      };
      return next;
    });
  };

  const onToggleBlindMode = () => {
    setStore((prev) => ({ ...prev, ui: { ...prev.ui, blindMode: !prev.ui.blindMode } }));
  };

  if (!authed) {
    return html`<${LoginPage} onLogin=${onLogin} />`;
  }

  const title =
    pathname === "/student/login" || pathname === "/student/portal"
      ? "Student Portal"
      : pathname === "/judge/dashboard"
      ? "Dashboard"
      : pathname === "/judge/review"
      ? "Project Review Workspace"
      : pathname === "/judge/leaderboard"
      ? "Leaderboard"
      : "Dashboard";
  const subtitle =
    pathname === "/student/login" || pathname === "/student/portal"
      ? "View problem statements and submit your projects"
      : pathname === "/judge/dashboard"
      ? "Overview & progress"
      : pathname === "/judge/review"
      ? "Switch projects instantly • evaluation always visible"
      : pathname === "/judge/leaderboard"
      ? "Ranked by total score • filter by category"
      : "";

  const right =
    pathname === "/judge/review"
      ? html`<div className="pill"><b>J/K</b> navigate</div>`
      : pathname === "/judge/leaderboard"
      ? html`<div className="pill">Scores update on submit</div>`
      : pathname === "/student/login" || pathname === "/student/portal"
      ? html`<div className="pill">Submission period active</div>`
      : html`<div className="pill">Welcome back</div>`;

  return html`<div className="appShell">
    <${Sidebar} routePath=${pathname} email=${store.auth.email} onLogout=${onLogout} />
    <main className="main">
      <${Topbar} title=${title} subtitle=${subtitle} right=${right} />
      ${pathname === "/judge/dashboard"
        ? html`<${DashboardPage} projects=${activeProjects} evaluations=${store.evaluations} email=${store.auth.email} />`
        : pathname === "/judge/review"
        ? html`<${ReviewWorkspacePage}
            projects=${activeProjects}
            evaluations=${store.evaluations}
            onSaveDraft=${onSaveDraft}
            onSubmit=${onSubmit}
            ui=${store.ui}
            onToggleBlindMode=${onToggleBlindMode}
            setToast=${setToast}
            email=${store.auth.email}
          />`
        : pathname === "/judge/leaderboard"
        ? html`<${LeaderboardPage} projects=${activeProjects} evaluations=${store.evaluations} />`
        : html`<${DashboardPage} projects=${activeProjects} evaluations=${store.evaluations} email=${store.auth.email} />`}
    </main>
    <${Toast} toast=${toast} onClose=${() => setToast(null)} />
  </div>`;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);

