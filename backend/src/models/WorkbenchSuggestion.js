const mongoose = require('mongoose');

const workbenchSuggestionSchema = new mongoose.Schema(
  {
    suggestionId: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true },
    icon: { type: String, default: '📌' },
    text: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workbenchSuggestionSchema.index({ category: 1, order: 1 });
workbenchSuggestionSchema.index({ category: 1, text: 1 });

module.exports = mongoose.model('WorkbenchSuggestion', workbenchSuggestionSchema);
