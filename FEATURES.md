# Features

## Completed

- **Release & hotfix branch names in header** — Input fields at the top of the dashboard capture the release branch name and hotfix branch name for the current week (e.g. `release/2026-W10`, `hotfix/auth-token-expiry`). Stored in the weekly JSON file alongside existing release metadata.

- **Inline hotfix tracking per service** — The separate Hotfix Tracker tab has been removed. Each service card in the service board now has a hotfix section toggled by a 🔥 button in the card's action area. When active, the inline panel shows hotfix label, notes, and merge-status checkboxes.

- **Hotfix merge status checkboxes** — Each service's inline hotfix panel includes three checkboxes tracking where the fix has been merged:
  - Merged to main
  - Merged to release branch (shows actual branch name from header if set)
  - Merged to hotfix branch (shows actual branch name from header if set)

## To Do

- **Remove phase bar** — The "📋 Planning → … → ✅ Done" bar at the top is clickable but has no functional effect. Remove it entirely.

- **Fix or remove summary counters** — The stat counters (Services, Approved, Deployed, Hotfixes, Failed) are broken: Approved and Deployed always show 0. Fix or remove.

- **Add pre-production to regional deployment tracker** — Add a `pre-production` entry alongside `us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`.

- **Move label/tag to regional deployment tab** — Remove the label/tag field from the service board; display it in the regional deployment tracker instead.
