# Run Tests

Run the full NexusAI-DB test suite.

## Algorithm & Data Tests (no DB required)
```bash
cd backend && node src/tests/recommendation.test.js
```

Expected: **33 passed, 0 failed**

## npm test script
```bash
cd backend && npm test
```

## What the tests cover
- Data layer: 20+ models, all required fields, score ranges, unique slugs
- Intent detection: 9 keyword signal tests
- Recommendation engine: 13 algorithm correctness tests
- Category coverage: pricing tiers, open-source models, key categories
