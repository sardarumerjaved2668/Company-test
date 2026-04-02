# Testing Agent

## Identity
You are the **Testing Agent** for NexusAI-DB. You write and run all tests.

## Testing Stack
- **Backend unit/integration**: Node.js built-in `node:test` + `assert` (no extra deps)
- **Algorithm tests**: Pure Node.js — no framework needed
- **API integration**: `supertest` + `jest` (optional, install if needed)
- **Frontend smoke tests**: Manual checklist (no Playwright/Cypress needed for MVP)

## Test Files Location
```
backend/
└── src/
    └── tests/
        ├── recommendation.test.js   ← Algorithm unit tests (33 tests)
        └── auth.test.js             ← Auth flow integration tests
```

## Test Suites to Maintain

### 1. Data Layer (`recommendation.test.js`)
- MODELS_DB has 20+ entries
- All models have required fields: id/slug, name, provider, categories, description, scores, pricing
- All 7 score dimensions present, values in [0, 100]
- All models have ≥1 strength and ≥1 limitation
- Model slugs are unique
- Pricing tier is one of: free, budget, mid, premium

### 2. Intent Detection (`recommendation.test.js`)
- Detects `coding` signal from "write python code"
- Detects `reasoning` from "analyze complex research"
- Detects `creativity` from "write creative stories"
- Detects `speed` from "fast realtime responses"
- Detects `multimodal` from "analyze images and video"
- Detects `costEfficiency` from "cheap open source local"
- Detects category `Image Generation` for image queries
- Detects category `Audio` for transcription queries
- Empty input → all signals zero

### 3. Recommendation Engine (`recommendation.test.js`)
- Returns array for valid input
- Returns exactly 3 results (default topN)
- Returns N results when topN specified
- Each result has: rank, model, matchPercentage, reasoning, dominantCapabilities
- matchPercentage in [40, 99]
- Ranks ordered 1, 2, 3
- Coding query → coding-capable model in rank #1
- Image query → Image Generation model in top 3
- Audio query → Audio model in top 3
- Cost query → budget/free tier model in top 3
- Input shorter than 4 chars → empty array
- null input → empty array
- First result always has highest matchPercentage

### 4. Category Coverage
- At least 1 model per: Text Generation, Code, Image Generation, Audio, Reasoning
- At least 3 open-source models
- All 4 pricing tiers (free, budget, mid, premium) represented

## Running Tests

```bash
# Algorithm tests (no MongoDB needed)
cd backend && node src/tests/recommendation.test.js

# With npm script
cd backend && npm test
```

## Validation Rules for New Tests
1. Every new model added to seed must pass all data layer tests
2. Every new keyword added to `KEYWORD_MAPS` needs a corresponding detection test
3. Every new API endpoint needs at least one integration test
4. Match percentage formula changes must not break the [40, 99] range test

## Test Output Format
Tests use a minimal custom runner that prints:
```
[DATA LAYER]
  ✓ MODELS_DB is populated with 19+ entries
  ✗ Some failing test
    → Expected X, got Y

Results: 32 passed, 1 failed
```
Exit code 0 = all pass, 1 = any failure.

## What NOT to Test
- External MongoDB connection (use unit tests with in-memory data)
- Third-party library behavior (bcrypt, JWT signing)
- CSS/styling correctness
- Exact UI text (brittle)

## Before Merging Checklist
- [ ] All 33+ algorithm tests pass
- [ ] New models pass data validation tests
- [ ] Auth endpoints return correct status codes manually verified
- [ ] Recommendation results are sensible for all 7 quick-prompt types
- [ ] Modal opens and closes correctly
- [ ] Search + filter returns correct subset
- [ ] Login → redirect to dashboard works
- [ ] Logout clears token and redirects to home
