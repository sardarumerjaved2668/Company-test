# NexusAI-DB — Coding Rules & Standards

## General

- All code is TypeScript-compatible JSX (`.jsx` files, no `.tsx` for simplicity)
- No external UI libraries — pure CSS with CSS custom properties
- No placeholder images — use emoji-based provider icons
- No hardcoded secrets — always use `.env` / `.env.local`
- Prefer `async/await` over raw Promise chains
- Always validate at system boundaries (API input, user input); trust internal code

## Backend Rules

### Structure

- All source code lives in `backend/src/`
- Route files only wire up middleware + controllers — no business logic
- Controllers handle HTTP; utils handle domain logic
- Mongoose models define schema + instance methods only

### API Standards

- All responses: `{ success: true|false, message?, data? }` shape
- HTTP status codes must be semantically correct (201 for create, 409 for conflict, etc.)
- Validation with `express-validator` on all mutation endpoints
- Rate limiting on all `/api/` routes; stricter on `/api/auth`

### Security Rules

- NEVER store plain-text passwords — bcrypt with salt rounds 12
- Access token: `1h` expiry, signed with `JWT_SECRET`
- Refresh token: `7d` expiry, signed with `JWT_REFRESH_SECRET`, stored in `httpOnly` cookie
- Refresh token stored in DB — compare on every refresh to detect theft
- `helmet()` on all responses
- CORS restricted to `CLIENT_URL` env var only
- Input body limited to `10kb`

### Error Handling

- All async controller functions wrapped in `try/catch` → `next(err)`
- Centralized `errorHandler` middleware normalizes Mongoose errors
- Never leak stack traces in production (`NODE_ENV=production`)

## Frontend Rules

### Next.js App Router

- Server components by default — add `'use client'` only when needed (hooks, events, browser APIs)
- `AuthContext`, all interactive components, and hooks → `'use client'`
- Use `next/navigation` (`useRouter`, `usePathname`) NOT `react-router-dom`
- Route protection via `middleware.js` (server-side) — no client-side-only guards
- Never use `<a>` for internal links — always `<Link>` from `next/link`

### State & Data

- Auth state in `AuthContext` — no prop drilling
- Server-side data fetching in Server Components where possible
- Client-side fetching via `axios` through the `services/api.js` singleton
- Axios interceptor handles token refresh automatically — don't duplicate that logic

### Styling

- All styles in `globals.css` using CSS custom properties defined in `:root`
- Glassmorphism: `backdrop-filter: blur()`, semi-transparent `var(--bg-card)` backgrounds
- Animations: CSS keyframes only — no animation libraries
- Responsive breakpoints: `768px` (tablet), `480px` (mobile)
- Never use inline styles except for dynamic values (e.g., provider-specific colors)

### Component Rules

- One component per file, file name = component name
- Props must be destructured at function signature
- `useEffect` cleanup functions for timers and event listeners
- Animated score bars: set `width: 0` on render, animate to target in `useEffect` after mount

## Recommendation Algorithm Rules

- Lives in `backend/src/utils/recommendation.js`
- `SPECIALIZED_CATEGORIES` (`Image Generation`, `Audio`) get `bonusPerCat = 0.50` to prevent text-model bias
- Weights are adaptive: strong keyword signals amplify relevant capability weights
- `matchPercentage` always clamped to `[40, 99]`
- Returns empty array for input shorter than 4 characters

## Git & Commit Rules

- Never commit `.env` or `.env.local` files
- Commit messages: `type(scope): message` format
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
  - Examples: `feat(backend): add refresh token rotation`, `fix(frontend): correct modal z-index`
- Always run `npm run seed` after schema changes

## File Naming

| Type             | Convention                  | Example                         |
| ---------------- | --------------------------- | ------------------------------- |
| React components | PascalCase                  | `ModelCard.jsx`                 |
| Hooks            | camelCase with `use` prefix | `useAuth.js`                    |
| Services/utils   | camelCase                   | `api.js`, `recommendation.js`   |
| Route files      | camelCase                   | `auth.js`                       |
| CSS              | kebab-case selectors        | `.model-card`, `.btn-recommend` |
