# Release Command

A browser-based dashboard for release managers to intake, coordinate, and track weekly multi-service deployments across multiple repositories and regions.

## What it does

Release Command helps a rotating release manager run a weekly release cycle:

- **Thursday** — branches are cut across repos and labels/tags are produced for each service
- **Thu–Fri** — labels are deployed to pre-production for weekend testing
- **Weekend** — teams test in pre-production; hotfix branches are cut for any bugs found
- **Monday** — teams confirm readiness, upstream dependencies are verified, a deployment window opens, teams deploy, and the release is declared done

The dashboard tracks all of this week by week, saves data as JSON files (one per week), and is visible to the whole organization via any browser.

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Runtime / package manager | Bun |
| Tests | Vitest + React Testing Library |
| Fonts | JetBrains Mono, IBM Plex Sans |
| Storage | File System Access API + JSON export/import |
| Backend | None — fully client-side |

## Getting started

```bash
bun install
bun run dev       # http://localhost:5173
bun run test      # run the test suite
bun run build     # production build
bun run preview   # preview the production build
```

The output in `dist/` is a static site — host it anywhere (Nginx, S3, GitHub Pages, etc.).

---

## Features

### Header

Always visible at the top of the page:

- **Session File** — editable filename (monospace). Press Enter or blur to switch sessions. Defaults to `release-<YYYY-Www>` for the current ISO week.
- **Release Manager** — free-text name, stored in the session file
- **Release Branch** — e.g. `release/2026-W10`, stored in the session file
- **Hotfix Branch** — e.g. `hotfix/auth-token-expiry`, stored in the session file
- **Save controls** — file operation buttons (see Storage) and an inline save-status indicator (`Saving…` / `✓ Saved` / `⚠ Save failed` / `● unsaved`)

### Summary Counters

Five at-a-glance counters below the header, updated in real time as service data changes:

| Counter | What it counts |
|---|---|
| **Services** | Total services in the release |
| **Approved** | Services with status `approved` or `deployed` |
| **Deployed** | Services with status `deployed` |
| **Hotfixes** | Services with an active hotfix |
| **Failed** | Services with status `failed` |

### Service Board

Add and manage every service in the release. Each service card shows:

- **Name** with current status pill and a HOTFIX badge when a hotfix is active
- **Repository** and **change type** pill (`code` / `config` / `both`)
- **Label** — release label/tag; shows the hotfix label when a hotfix is active and a hotfix label is set
- **POC** — point of contact
- **Dependencies** — other services in the release this one depends on (shown only when non-empty)
- **Status selector** — ten clickable chips at the bottom of each card. Clicking one updates the service status immediately and reflects in the summary counters:
  `pending` `branch-cut` `labeled` `testing` `approved` `needs-hotfix` `hotfix-ready` `deploying` `deployed` `failed`
- **Inline hotfix section** (shown when a hotfix is active) — red-accented panel with:
  - Hotfix Label input
  - Hotfix Notes input
  - Three merge-status checkboxes: **Merged to main** / **Merged to `<releaseBranch>`** / **Merged to `<hotfixBranch>`** (labels use the actual branch names from the header when set)
- **Action buttons** — 🔥 toggle hotfix on/off, ✏️ edit inline, 🗑️ remove

### Dependency Map

Visual card grid showing which services depend on which. Each card shows:

- Upstream dependencies with a green ✅ background if the dependency's status is `approved` or `deployed`, amber ⏳ otherwise
- Downstream services that depend on this one

### Regional Deployment Tracker

Table view — one row per service, one column per region — for tracking where each label has been deployed.

Regions: `us-east-1` `us-west-2` `eu-west-1` `ap-southeast-1`

Each cell has a colour-coded dropdown: `pending` (grey) / `deploying` (amber) / `deployed` (green) / `failed` (red). The Label column shows the hotfix label when one is active.

### Release Checklist

An 11-item ordered checklist covering the full weekly release lifecycle, from branch-cut through deployment confirmation. Each item is toggled by clicking. Completed items are struck through. A progress bar and `N / 11 complete` count appear above the list.

A **Release Notes / Comments** textarea at the bottom is persisted in the session file.

### File Storage

Data is saved as `release-YYYY-WNN.json` (e.g. `release-2026-W10.json`). Two modes:

- **Chrome / Edge** — uses the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access). Click **📂 Set Save Folder** once; changes auto-save after a 1-second debounce. A hint banner prompts for this when no folder is connected.
- **Other browsers** — use **💾 Export** to download the JSON and **📄 Import** to load it back. A banner explains this when the FSA API is unavailable.

Importing a file also updates the session name to match the loaded file's name.

Files can be stored in any shared folder (e.g. a network drive or synced cloud folder) so the whole team has access to historical data.

### Dark / Light Mode

Follows the OS `prefers-color-scheme` automatically. No manual toggle.

---

## Data format

Each week's release is stored as a single JSON file:

```json
{
  "releaseManager": "Alice",
  "releaseBranch": "release/2026-W10",
  "hotfixBranch": "hotfix/auth-token-expiry",
  "phase": "deploying",
  "notes": "Smooth week, one hotfix on auth-service",
  "checklist": {
    "branches_cut": true,
    "labels_produced": true
  },
  "services": [
    {
      "id": "svc-1234567890",
      "name": "auth-service",
      "repo": "org/auth-service",
      "changeType": "code",
      "label": "v2.14.0-rc1",
      "poc": "Bob",
      "dependencies": ["user-service"],
      "status": "deployed",
      "regions": {
        "us-east-1": "deployed",
        "us-west-2": "deployed",
        "eu-west-1": "deploying",
        "ap-southeast-1": "pending"
      },
      "hasHotfix": true,
      "hotfixLabel": "v2.14.1-hotfix",
      "hotfixNotes": "Fix token expiry bug",
      "hotfixMergedMain": true,
      "hotfixMergedRelease": true,
      "hotfixMergedHotfix": false,
      "deployConfirmed": false
    }
  ]
}
```

### Field reference

**Release**

| Field | Type | Description |
|---|---|---|
| `releaseManager` | string | Name of the release manager for this session |
| `releaseBranch` | string | Release branch name, e.g. `release/2026-W10` |
| `hotfixBranch` | string | Active hotfix branch name |
| `phase` | string | Current release phase (`planning` `branch-cut` `labeled` `testing` `review` `deploying` `done`). Stored for data compatibility; drives phase pills in the checklist tab. |
| `notes` | string | Free-text release notes |
| `checklist` | object | Boolean map of completed checklist item keys |
| `services` | array | List of service objects (see below) |

**Service**

| Field | Type | Description |
|---|---|---|
| `id` | string | `svc-<timestamp>`, generated on creation |
| `name` | string | Service name |
| `repo` | string | Repository identifier |
| `changeType` | `code` \| `config` \| `both` | Nature of the change |
| `label` | string | Release label/tag (e.g. `v2.14.0-rc1`) |
| `poc` | string | Point of contact |
| `dependencies` | string[] | Names of other services this one depends on |
| `status` | string | One of `pending` `branch-cut` `labeled` `testing` `approved` `needs-hotfix` `hotfix-ready` `deploying` `deployed` `failed` |
| `regions` | object | Per-region status: each value is `pending` `deploying` `deployed` `failed` |
| `hasHotfix` | boolean | Whether a hotfix is active for this service |
| `hotfixLabel` | string | Hotfix label/tag |
| `hotfixNotes` | string | Description of the bug being fixed |
| `hotfixMergedMain` | boolean | Hotfix merged to main branch |
| `hotfixMergedRelease` | boolean | Hotfix merged to the release branch |
| `hotfixMergedHotfix` | boolean | Hotfix merged to the hotfix branch |
| `deployConfirmed` | boolean | Stored for future use; not yet surfaced in the UI |
