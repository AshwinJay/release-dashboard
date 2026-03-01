# Release Command

A browser-based dashboard for release managers to intake, coordinate, and track weekly multi-service deployments across multiple repositories and regions.

## What it does

Release Command helps a rotating release manager run a weekly release cycle:

- **Thursday** — branches are cut across repos and labels/tags are produced for each service
- **Thu–Fri** — labels are deployed to pre-production for weekend testing
- **Weekend** — teams test in pre-production; hotfix branches are cut for any bugs found
- **Monday** — teams confirm readiness, upstream dependencies are verified, a deployment window opens, teams deploy, and the release is declared done

The dashboard tracks all of this week by week, saves data as JSON files (one per week), and is visible to the whole organization via any browser.

## Features

### Service Board
Add and manage every service in the release. Each service tracks:
- Name, repository, and change type (`code` / `config` / `both`)
- Release label / tag (and hotfix label if applicable)
- Point of contact
- Status: `pending` → `branch-cut` → `labeled` → `testing` → `approved` → `deploying` → `deployed` (or `needs-hotfix` / `failed`)
- Dependencies on other services in the same release

### Dependency Map
Visual grid showing which services depend on which. Highlights whether upstream dependencies are approved/deployed (green) or still pending (red), so coordinators can sequence deployments correctly.

### Regional Deployment Tracker
Table view of deployment status per service per region (`us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`). Each cell cycles through `pending → deploying → deployed → failed`.

### Hotfix Tracker
Flag services that need a bug fix during the release cycle. Records hotfix branch labels and notes per service, and updates service status to `needs-hotfix` automatically.

### Release Checklist
An ordered checklist from branch cut through deployment confirmation with a progress bar. Also has a free-text notes field for the week.

### Phase Bar
The overall release phase is always visible at the top: Planning → Branch Cut → Labeled → Testing → Mon Review → Deploying → Done. Clickable to advance manually.

### File Storage

Data is saved as `release-YYYY-WNN.json` (e.g. `release-2026-W10.json`). Two modes:

- **Chrome / Edge** — uses the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access). Click "Set Save Folder" once; changes auto-save after 1 second of inactivity.
- **Other browsers** — use **Export** to download the JSON and **Import** to load it back.

The header has a **Session File** field showing the base name of the active JSON file (e.g. `release-2026-W10`). Edit it and press Enter (or tab away) to switch to a different file — if a save folder is connected the new file is loaded automatically, otherwise use Import/Export. Importing a file also updates the session file name to match the loaded file's name.

The header also has fields for the **Release Branch** (e.g. `release/2026-W10`) and **Hotfix Branch** (e.g. `hotfix/auth-token-expiry`) for the current session. These are stored in the JSON file alongside the release manager name and phase.

### Dark / Light Mode
Follows the OS preference automatically. No manual toggle needed.

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Runtime / package manager | Bun |
| Fonts | JetBrains Mono, IBM Plex Sans |
| Storage | File System Access API + JSON export/import |
| Backend | None — fully client-side |

## Getting started

```bash
bun install
bun run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
bun run build
bun run preview
```

The output in `dist/` is a static site — host it anywhere (Nginx, S3, GitHub Pages, etc.).

## Data format

Each week's release is stored as a single JSON file:

```json
{
  "releaseManager": "Alice",
  "releaseBranch": "release/2026-W10",
  "hotfixBranch": "hotfix/auth-token-expiry",
  "phase": "deploying",
  "notes": "Smooth week, one hotfix on auth-service",
  "checklist": { "branches_cut": true, "labels_produced": true },
  "services": [
    {
      "id": "svc-1234567890",
      "name": "auth-service",
      "repo": "org/auth-service",
      "changeType": "code",
      "label": "v2.14.0-rc1",
      "hotfixLabel": "v2.14.1-hotfix",
      "poc": "Bob",
      "dependencies": ["user-service"],
      "status": "deployed",
      "hasHotfix": true,
      "hotfixNotes": "Fix token expiry bug",
      "deployConfirmed": false,
      "regions": {
        "us-east-1": "deployed",
        "us-west-2": "deployed",
        "eu-west-1": "deploying",
        "ap-southeast-1": "pending"
      }
    }
  ]
}
```

Files are named `release-YYYY-WNN.json` and can be stored in any shared folder (e.g. a network drive or synced cloud folder) so the whole team has access to historical data.
