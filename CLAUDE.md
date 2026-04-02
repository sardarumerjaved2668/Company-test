# NexusAI-DB — Claude Project Instructions

## Project Overview
**NexusAI-DB** is a full-stack AI Model Recommendation System.
- 20+ AI models database with capability scoring across 7 dimensions
- Keyword-detection + weighted-scoring recommendation algorithm returning top 3 matches
- JWT authentication (access token in memory/localStorage + refresh token in httpOnly cookie)
- Dark glassmorphism UI

## Architecture

```
nexusai-db/
├── CLAUDE.md              ← You are here
├── RULES.md               ← Coding standards (always follow)
├── .claude/
│   ├── agents/            ← Three specialized agents
│   │   ├── backend.md
│   │   ├── frontend.md
│   │   └── testing.md
│   └── commands/          ← Custom slash-command skills
│       ├── seed.md
│       ├── dev.md
│       └── test.md
├── backend/               ← Express 4 + MongoDB (Mongoose 8) API
│   ├── src/
│   │   ├── config/        ← DB connection
│   │   ├── controllers/   ← Route handlers (auth, models, recommend)
│   │   ├── middleware/     ← JWT protect, restrictTo, errorHandler
│   │   ├── models/        ← Mongoose schemas (User, AIModel)
│   │   ├── routes/        ← Express routers
│   │   ├── seed/          ← DB seeder script
│   │   └── utils/         ← Recommendation algorithm
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/              ← Next.js 14 (App Router)
    ├── src/
    │   ├── app/           ← File-system routing
    │   │   ├── layout.jsx
    │   │   ├── page.jsx   ← Home
    │   │   ├── login/
    │   │   ├── register/
    │   │   └── dashboard/
    │   ├── components/    ← Reusable UI components
    │   ├── context/       ← AuthContext (client)
    │   ├── hooks/         ← useAuth
    │   ├── services/      ← Axios API client
    │   └── styles/        ← globals.css (glassmorphism dark)
    ├── middleware.js       ← Next.js route protection
    ├── next.config.js
    └── package.json
```

## Three-Agent System

| Agent | File | Responsibility |
|---|---|---|
| **Backend** | `.claude/agents/backend.md` | Express routes, Mongoose models, JWT, recommendation algorithm |
| **Frontend** | `.claude/agents/frontend.md` | Next.js App Router, components, AuthContext, glassmorphism UI |
| **Testing** | `.claude/agents/testing.md` | API tests, algorithm validation, component smoke tests |

## Key Technical Decisions
- **Refresh token** stored in `httpOnly` cookie — never accessible to JS
- **Access token** stored in `localStorage` — 1h expiry
- Axios interceptor auto-refreshes on `TOKEN_EXPIRED` response
- **Recommendation algorithm** uses adaptive weighting; specialized domains (Image/Audio) get 0.5 category bonus to overcome text-model bias
- Next.js `middleware.js` guards `/dashboard` server-side (no client-side flash)
- Soft-delete pattern for AI models (`isActive: false`)

## Running the Project

```bash
# Backend
cd backend && cp .env.example .env   # fill in values
npm install && npm run seed && npm run dev

# Frontend
cd frontend && cp .env.local.example .env.local
npm install && npm run dev
```

## Environment Variables
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — sign access tokens
- `JWT_REFRESH_SECRET` — sign refresh tokens
- `NEXT_PUBLIC_API_URL` — backend base URL (frontend)
