import { useState, useEffect } from "./core.js";

const STORAGE_KEY = "review_portal_v1";

export const PROJECTS = [
  { id: "p1", name: "Adrian Bert — CRM Dashboard", team: "Keitoto Studio", category: "SaaS", description: "A CRM dashboard that helps sales teams track leads, pipeline stages, and outreach performance with role-based access and analytics.", members: ["Aarav", "Maya", "Sofia", "Rohan"], links: { github: "https://github.com/example/crm-dashboard", ppt: "https://example.com/crm-deck", demo: "https://example.com/crm-demo" } },
  { id: "p2", name: "Trust — SaaS Dashboard", team: "North Star", category: "SaaS", description: "A secure admin portal focused on auditability, granular permissions, and a delightful dashboard experience for operations teams.", members: ["Isha", "Noah", "Liam"], links: { github: "https://github.com/example/trust-saas", ppt: "https://example.com/trust-deck", demo: "https://example.com/trust-demo" } },
  { id: "p3", name: "Pertamina Project", team: "Blue Circuit", category: "Energy", description: "A planning tool for field operations to report maintenance status and track safety checks with offline-first syncing.", members: ["Zara", "Kabir", "Olivia"], links: { github: "https://github.com/example/pertamina", ppt: "https://example.com/pertamina-deck", demo: "https://example.com/pertamina-demo" } },
  { id: "p4", name: "Garuda Project", team: "SkyWorks", category: "Travel", description: "A travel experience platform that bundles itinerary planning, local discovery, and smart budgeting into one interface.", members: ["Ethan", "Aanya", "Lucas", "Meera"], links: { github: "https://github.com/example/garuda", ppt: "https://example.com/garuda-deck", demo: "https://example.com/garuda-demo" } }
];

export const PROBLEM_STATEMENTS = [
  { id: "s1", title: "AI Customer Support Agent", description: "Build an intelligent chatbot that can resolve 80% of tier-1 support tickets using LLMs and an internal knowledge base.", deadline: "2026-05-15", difficulty: "Hard", tags: ["AI/ML", "Backend"] },
  { id: "s2", title: "Eco-Tracker Dashboard", description: "Create a beautiful, responsive dashboard for users to track their daily carbon footprint with gamification elements.", deadline: "2026-05-10", difficulty: "Medium", tags: ["Frontend", "Data Viz"] },
  { id: "s3", title: "Decentralized Voting System", description: "Design a secure, transparent voting system using smart contracts to prevent tampering and ensure anonymity.", deadline: "2026-05-20", difficulty: "Hard", tags: ["Web3", "Security"] },
  { id: "s4", title: "Local Food Rescuers", description: "A mobile-first web app connecting restaurants with surplus food to local shelters and food banks in real-time.", deadline: "2026-05-12", difficulty: "Easy", tags: ["Fullstack", "Mobile-First"] }
];

function defaultStore() {
  return {
    judgeAuth: { email: "" },
    studentAuth: { email: "" },
    evaluations: {},
    ui: { blindMode: false },
    submissions: [],
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    
    if (store.auth) {
       store.judgeAuth = store.auth;
       delete store.auth;
    }
    if (!store.judgeAuth) store.judgeAuth = { email: "" };
    if (!store.studentAuth) store.studentAuth = { email: "" };
    
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

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useStore() {
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
