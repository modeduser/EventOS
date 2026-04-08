# Review Portal (React SPA, no build)

This is a single-page judging portal with:

- **Login → Dashboard → Review Workspace** flow
- **3-panel split layout** (project list / details / fixed evaluation sidebar)
- **Always-visible evaluation** (no separate evaluation page)
- **Draft auto-save** while typing + manual **Save Draft**
- **Submit Evaluation** marks project as reviewed and auto-selects the next pending project
- **Leaderboard** ranks projects by total score (filterable by category)
- **Progress indicator** (X/Y reviewed) and **keyboard shortcuts** (Review page)

## Run locally

Because this is a no-build React setup (React is loaded via CDN), you just need a static server.

From this folder:

```bash
ruby -run -ehttpd . -p 5173
```

Then open:

- `http://localhost:5173/#/login`

## Keyboard shortcuts (Review Workspace)

- **J**: next project
- **K**: previous project
- **S**: save draft

## Data & persistence

- **Mock projects** live in `app.js` (`PROJECTS` array)
- Drafts/submissions are stored in **localStorage** under key `review_portal_v1`

