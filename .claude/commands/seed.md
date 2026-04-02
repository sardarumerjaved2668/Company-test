# Seed Database

Seed the MongoDB database with all 20 AI models.

## Steps
1. Make sure MongoDB is running and `.env` has correct `MONGO_URI`
2. Run the seed script from the backend directory

```bash
cd backend && node src/seed/seedModels.js
```

Expected output:
```
Connected to MongoDB
Cleared existing models
Seeded 20 AI models
Done. Disconnected.
```

## Re-seeding
The seed script uses `deleteMany({})` before inserting — safe to run multiple times.
Run after any schema changes to `AIModel.js`.
