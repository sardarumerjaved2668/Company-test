# Start Development Servers

Start both backend and frontend development servers.

## Backend (Terminal 1)
```bash
cd backend
cp .env.example .env   # first time only — fill in values
npm install            # first time only
npm run dev            # starts on http://localhost:5000
```

## Frontend (Terminal 2)
```bash
cd frontend
cp .env.local.example .env.local   # first time only
npm install                         # first time only
npm run dev                         # starts on http://localhost:3000
```

## Health Check
```bash
curl http://localhost:5000/api/health
```

## First-Time Setup Order
1. Start MongoDB
2. `cd backend && npm install && npm run seed && npm run dev`
3. `cd frontend && npm install && npm run dev`
4. Open http://localhost:3000
