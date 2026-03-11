# Plans

## Multi-user sync via shared folder

### Design decision

Each user writes their own per-user JSON file (`release-YYYY-WNN-<username>.json`) to a shared cloud folder (Google Drive, OneDrive, Dropbox, etc.) mounted locally. On load, the app reads all matching files and merges them into a unified view. No server, no OAuth, no CRDT library. Cloud sync is handled by the OS sync client.

File I/O layer is deferred: browser-only (File System Access API, Chrome/Edge only) or Tauri desktop app.

### Merge strategy

- **Scalars** (`releaseManager`, `releaseBranch`, `hotfixBranch`, `phase`): file with latest `savedAt` wins
- **Services**: union by `id`, latest `updatedAt` wins per service; tombstoned items excluded from UI but retained in data
- **Checklist**: OR-merge (checked by anyone = checked)
- **Notes**: union by `id`, latest `updatedAt` wins per note (including tombstones)

### Phases

#### Phase 1 — Data model changes
- Add `updatedAt: Date.now()` to every service and note mutation
- Add `deletedAt` tombstone to services and notes — replace array splice with tombstone; UI filters tombstoned items; merge propagates tombstones to all users
- Add `savedAt` to top-level file JSON

#### Phase 2 — Username / identity
- Prompt for username on first load if none stored in `localStorage`
- Simple modal, no auth — used only for filename (`release-2026-W10-alice.json`)

#### Phase 3 — File System Access API integration
- "Open sync folder" button stores a `FileSystemDirectoryHandle` in IndexedDB (persists across sessions)
- On save: write `release-YYYY-WNN-<username>.json` to the folder
- On load: glob `release-YYYY-WNN-*.json`, parse each, run merge, display merged state
- Polling: `setInterval` every 10–30s — re-read all files, re-merge, update state if result differs

#### Phase 4 — Merge function
Pure function, fully testable: `mergeReleases(files[]) → release`

#### Phase 5 — Tests
- `mergeReleases()` unit tests: concurrent edits, tombstones, checklist OR-merge, scalar last-write-wins
- Integration tests: folder picker mock, save/load round-trip per-user file
- Existing tests must continue to pass (no behaviour change when folder not connected)

### Implementation order

1. Data model (`updatedAt`, `deletedAt`, `savedAt`) + update all mutations
2. `mergeReleases()` pure function + tests
3. Username prompt
4. Folder picker + read/write own file
5. Load-time merge of all files
6. Polling loop
7. UI indicator (who else has a file in this folder, last seen time)

### Notes

- Phases 1–2 (data model + merge function) are fully independent of the File System Access API decision and can be implemented and tested first
- Tombstones are the only tricky edge case — a deleted item reappears on merge without them
