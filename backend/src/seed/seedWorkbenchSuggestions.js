require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const WorkbenchSuggestion = require('../models/WorkbenchSuggestion');
const { SUGGESTIONS } = require('../data/workbenchSuggestions');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB (workbench suggestions)');

  let n = 0;
  for (const [category, rows] of Object.entries(SUGGESTIONS)) {
    let order = 0;
    for (const row of rows) {
      await WorkbenchSuggestion.findOneAndUpdate(
        { suggestionId: row.id },
        {
          suggestionId: row.id,
          category,
          icon: row.icon,
          text: row.text,
          order: order++,
        },
        { upsert: true, new: true }
      );
      n += 1;
    }
  }

  console.log(`Workbench suggestions seeded (${n} rows).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
