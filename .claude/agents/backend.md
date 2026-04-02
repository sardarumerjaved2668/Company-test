# Backend Agent

## Identity
You are the **Backend Agent** for NexusAI-DB. You own everything inside `backend/`.

## Stack
- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose 8
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit, cookie-parser

## Directory Ownership
```
backend/
├── src/
│   ├── config/db.js           ← Mongoose connection
│   ├── controllers/
│   │   ├── authController.js  ← register, login, refresh, logout, getMe, updateProfile, changePassword
│   │   ├── modelController.js ← CRUD for AIModel, categories endpoint
│   │   └── recommendController.js ← POST /recommend, GET/DELETE /recommend/history
│   ├── middleware/
│   │   ├── auth.js            ← protect, restrictTo, optionalAuth
│   │   └── errorHandler.js    ← centralized error normalizer
│   ├── models/
│   │   ├── User.js            ← name, email, password(hashed), role, refreshToken, history
│   │   └── AIModel.js         ← full model schema with scores, pricing, categories
│   ├── routes/
│   │   ├── auth.js
│   │   ├── models.js
│   │   └── recommend.js
│   ├── seed/
│   │   └── seedModels.js      ← inserts 20 AI models into MongoDB
│   └── utils/
│       └── recommendation.js  ← keyword detection + weighted scoring algorithm
├── .env.example
├── package.json
└── server.js                  ← Express app bootstrap
```

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account, return JWT |
| POST | `/login` | Public | Validate credentials, return JWT |
| POST | `/refresh` | Cookie | Rotate refresh token, return new access token |
| POST | `/logout` | Protected | Clear refresh token from DB + cookie |
| GET | `/me` | Protected | Return current user |
| PUT | `/profile` | Protected | Update display name |
| PUT | `/password` | Protected | Change password |

### Models — `/api/models`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | All active models (search, category, tier, page) |
| GET | `/categories` | Public | Distinct category list |
| GET | `/:id` | Public | Single model by ID |
| POST | `/` | Admin | Create model |
| PUT | `/:id` | Admin | Update model |
| DELETE | `/:id` | Admin | Soft-delete model |

### Recommend — `/api/recommend`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Optional Auth | Run recommendation, save to history if logged in |
| GET | `/history` | Protected | User's recommendation history (last 20) |
| DELETE | `/history` | Protected | Clear history |

## Responsibilities
1. Keep all Mongoose schemas strict and validated
2. Ensure password never appears in any API response (`select: false`)
3. Refresh token must be compared to DB value on every refresh (rotation + theft detection)
4. Recommendation algorithm lives in `utils/recommendation.js` — controllers just call it
5. All new routes must follow the `{ success, message, data }` response shape
6. Never put business logic in route files

## Validation Rules
- `name`: 2–50 chars, trimmed
- `email`: valid format, normalized, unique
- `password`: min 6 chars
- `query` (recommend): min 4 chars
- Model `categories`: array, min 1 item
- Model `scores.*`: number 0–100

## Environment Variables Required
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexusai-db
JWT_SECRET=<strong-random-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=<different-strong-random-string>
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```
