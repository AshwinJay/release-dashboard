# Project conventions

## After every change

1. **Run the tests** — `bun run test`. All tests must pass before committing.
2. **Write tests for new behaviour** — any new feature or bug fix needs test coverage in `src/App.test.jsx`.
3. **Fix broken tests** — never leave a test suite in a failing state.
4. **Keep README.md current** — if a feature is added, removed, or changes behaviour, update the relevant section in README.md (features, data model, field reference).
5. **Keep TODOS.md current** — mark items `[x]` when done. Add new todos as they come up.

## Running the project

```bash
bun run dev     # dev server at http://localhost:5173
bun run test    # Vitest test suite
bun run build   # production build
```

## Key files

- `src/App.jsx` — entire application (single file)
- `src/App.test.jsx` — integration tests
- `src/test-setup.js` — Vitest setup (jest-dom + matchMedia mock)
- `README.md` — user-facing project documentation
- `TODOS.md` — feature backlog
