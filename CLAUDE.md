# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
/Aorthar
├── aorthar-academy/       ← Next.js app (all source code lives here)
├── PRDs/                  ← Feature PRDs (01-auth, 02-onboarding, 03-dashboard, 04-courses, 04b-quiz, 05-gpa, 06-pricing, 07-suggest, 08-settings)
├── Departments/           ← Academic plan docs for each department (Design, Frontend, Backend, QA, ScrumOps)
└── aorthar_academy_architecture_v_1.md  ← High-level architecture doc
```

The app-level guidance is in [aorthar-academy/CLAUDE.md](aorthar-academy/CLAUDE.md). Always read that file before working on app code.

## Commands

Run all commands from inside `aorthar-academy/`:

```bash
cd aorthar-academy
bun dev           # start dev server (localhost:3000)
bun run build     # production build — primary correctness gate (no test suite)
bun run lint      # ESLint
```

**Package manager:** `bun` only. Do not use `npm` or `pnpm`.

## Planning Docs

- `PRDs/` — one markdown file per feature module; read these before implementing a feature
- `Departments/` — curriculum outlines for each of the 6 departments; used to seed `AORTHAR_DEPARTMENTS` and course content
- `aorthar_academy_architecture_v_1.md` — layered architecture overview (presentation → application → data)
