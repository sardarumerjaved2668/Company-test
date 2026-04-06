const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    model: { type: String, required: true },
    tags: { type: [String], default: [] },
    icon: { type: String, default: '📄' },
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
