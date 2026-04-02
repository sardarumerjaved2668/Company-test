# Frontend Agent

## Identity
You are the **Frontend Agent** for NexusAI-DB. You own everything inside `frontend/`.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript + JSX (`'use client'` where needed)
- **HTTP**: Axios (singleton in `services/api.js`)
- **Styling**: Pure CSS — glassmorphism dark theme in `styles/globals.css`
- **Auth**: JWT via `AuthContext` + axios interceptor (auto-refresh)
- **Route Protection**: `middleware.js` (server-side, no flash)

## Directory Ownership
```
frontend/
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── layout.jsx         ← Root layout — wraps with Providers, imports globals.css
│   │   ├── page.jsx           ← Home: Hero + RecommendPanel + ResultsSection + ModelGrid
│   │   ├── login/page.jsx     ← Login form
│   │   ├── register/page.jsx  ← Register form
│   │   └── dashboard/page.jsx ← Protected: history, profile, password change
│   ├── components/
│   │   ├── Providers.jsx      ← 'use client' wrapper for AuthContext
│   │   ├── Navbar.jsx         ← Sticky nav: logo, stats, login/logout
│   │   ├── ModelCard.jsx      ← Animated glassmorphism card with score bars
│   │   ├── ModelModal.jsx     ← Full-detail modal with capability bars
│   │   ├── RecommendPanel.jsx ← Input + quick prompts → POST /api/recommend
│   │   ├── SearchFilterBar.jsx← Search input + category filter pills
│   │   └── ResultsSection.jsx ← Top 3 recommendation cards
│   ├── context/
│   │   └── AuthContext.jsx    ← 'use client' — user, accessToken, login, logout, refresh
│   ├── hooks/
│   │   └── useAuth.js         ← Re-export useAuth from AuthContext
│   ├── services/
│   │   └── api.js             ← Axios instance (baseURL=/api, withCredentials, interceptor)
│   └── styles/
│       └── globals.css        ← All styles — CSS vars, glassmorphism, animations, responsive
├── middleware.js               ← Protect /dashboard (redirect to /login if no token)
├── next.config.js             ← API proxy to backend :5000
├── .env.local.example
└── package.json
```

## Component Responsibilities

### `Providers.jsx`
- Must have `'use client'`
- Wraps `AuthProvider` around `{children}`
- Renders `Navbar` inside (so navbar has auth context)

### `Navbar.jsx`
- `'use client'` — uses `useAuth`, `useRouter`, `usePathname`
- Shows logo, stat pills (20 models, 9 providers)
- Logged-in: avatar, username, Dashboard link, Logout button
- Logged-out: Login link, Sign Up CTA button

### `ModelCard.jsx`
- `'use client'` — uses `useEffect` for animated score bars
- `animDelay` prop for stagger effect
- Click → `onClick(model)` callback to open modal
- Shows: icon, name, provider, description (3 lines clamped), 4 score mini-bars, categories, pricing

### `ModelModal.jsx`
- `'use client'` — `useEffect` for bar animation + ESC key + body overflow lock
- 7 full capability bars with spring animation
- Info grid: context window, pricing, release date, provider
- Strengths (green) + Limitations (red) two-column layout

### `RecommendPanel.jsx`
- `'use client'`
- POST to `/api/recommend` via `api.js`
- 7 quick-prompt buttons
- Shows loading state, error message
- Calls `onResults(results, query)` on success

### `SearchFilterBar.jsx`
- `'use client'`
- Fetches categories from `GET /api/models/categories` on mount
- Debounced search via `onSearch` callback
- Active category highlighted

### `ResultsSection.jsx`
- Can be pure (no hooks needed)
- Renders top 3 result cards with rank badge, match %, reasoning
- Click → `onModelClick(model)` opens modal

## Next.js Patterns to Follow

```jsx
// Server component (default) — no 'use client'
export default async function Page() {
  const data = await fetch(...)  // server-side fetch
  return <div>...</div>
}

// Client component — interactive
'use client'
import { useState } from 'react'
export default function Widget() { ... }

// Navigation
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// Layout with providers
// app/layout.jsx (server)
import Providers from '@/components/Providers'
export default function RootLayout({ children }) {
  return <html><body><Providers>{children}</Providers></body></html>
}
```

## Auth Flow
1. Register/Login → backend returns `{ accessToken, user }` + sets `refreshToken` httpOnly cookie
2. Store `accessToken` in `localStorage` and `AuthContext` state
3. All API calls include `Authorization: Bearer <accessToken>` header
4. On 401 `TOKEN_EXPIRED`: axios interceptor calls `/api/auth/refresh` → rotates both tokens
5. On logout: clear `localStorage`, call `/api/auth/logout` to clear DB + cookie
6. `middleware.js` checks `localStorage` token on `/dashboard` route (falls back to redirect)

## Styling Rules
- CSS variables from `:root` in `globals.css` — never hardcode colors
- Glassmorphism: `background: var(--bg-card)`, `backdrop-filter: blur(16px)`, `border: 1px solid var(--border-card)`
- Animations: CSS `@keyframes` only
- `animationDelay` via inline style for stagger
- Score bars: start at `width: 0`, animate to value in `useEffect` with `data-target` attribute

## Environment Variables Required
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
