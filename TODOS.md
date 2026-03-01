# Features

## To Do

- **Release & hotfix branch names in header** — Add input fields at the top of the dashboard to capture the release branch name and the hotfix branch name for the current week (e.g. `release/2026-W10`, `hotfix/auth-token-expiry`). These should be stored in the weekly JSON file alongside existing release metadata.

- **Hotfix merge status checkboxes** — For each hotfix entry, add a sub-section with three checkboxes to track where the hotfix has been merged:
  - Merged to main
  - Merged to release branch
  - Merged to hotfix branch

- **Remove phase bar** — The "📋 Planning → ✂️ Branch Cut → 🏷️ Labeled → 🧪 Testing → 👀 Mon Review → 🚀 Deploying → ✅ Done" bar at the top is clickable but has no functional effect. Remove it entirely.

- **Fix or remove summary counters** — The stat counters at the top of the dashboard (Services, Approved, Deployed, Hotfixes, Failed) are broken: Approved and Deployed always show 0 even when services are in those states. Either fix the counts to reflect actual service statuses or remove the counter strip entirely.

- **Add pre-production to regional deployment tracker** — Add a `pre-production` entry to the regional deployment tracker alongside the existing regions (`us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1`).

- **Move label/tag to regional deployment tab** — Remove the label/tag field from the service board and display it in the regional deployment tracker tab instead.

- **Inline hotfix tracking per service** — Remove the separate Hotfix Tracker tab. Instead, add a hotfix section directly on each service card in the service board. All functionality from the hotfix tab (hotfix branch label, notes, and merge status checkboxes for main/release/hotfix branch) should be accessible inline per service, toggled by a "Request Hotfix" option on the service.
