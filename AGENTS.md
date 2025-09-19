# Repository Guidelines

## Project Structure & Module Organization
This Next.js (App Router) project keeps routable pages under `src/app`; use `layout.tsx` for shared chrome and `globals.css` for base styles. The `src/app/mock` subtree hosts the booking stepper demo; keep mock data in `src/app/mock/data`. Shared React components live in `src/components`, with `Silk.jsx` for the animated hero background and `mode-toggle.tsx` / `theme-provider.tsx` handling theming. UI primitives generated via shadcn/ui sit under `src/components/ui` (e.g. `button.tsx`, `calendar.tsx`, `stepper.tsx`); extend these instead of duplicating markup. Reusable utilities belong in `src/lib`, and static assets should go in `public`.

## Build, Test, and Development Commands
Run `npm run dev` to start the Turbopack-powered Next.js dev server with hot reload. Use `npm run build` for a production bundle and `npm run start` to serve that bundle locally. `npm run lint` executes ESLint with the `next/core-web-vitals` and TypeScript presets; run it before opening a pull request.

## Coding Style & Naming Conventions
Stick to TypeScript or modern JSX; keep components in PascalCase and hooks/utilities in camelCase. Follow the prevailing two-space indentation seen in `src/components/Silk.jsx`, and group Tailwind utility classes logically (layout → spacing → color). Prefer the shared `cn` helper from `src/lib/utils.ts` for conditional class merging. ESLint is the source of truth; add rule overrides sparingly and document them inline.

## Testing Guidelines
Automated tests are not yet configured. When adding coverage, place `*.test.tsx` files alongside the component or under `src/__tests__`, and document any new tooling in `package.json`. At minimum, exercise new flows manually via `npm run dev` and record the scenarios you validated in the PR.

## Commit & Pull Request Guidelines
The history uses Conventional Commits (`fix: …`, `feat: …`); keep that format with concise, imperative summaries. For pull requests, include: 1) a short problem statement, 2) screenshots or screen recordings for UI-facing changes, and 3) notes on manual or automated testing. Link related issues with GitHub keywords so they auto-close on merge.
