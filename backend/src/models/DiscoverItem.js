const mongoose = require('mongoose');

const discoverItemSchema = new mongoose.Schema(
  {
    lab: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    publishDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiscoverItem', discoverItemSchema);
