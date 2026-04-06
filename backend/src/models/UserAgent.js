const mongoose = require('mongoose');

const userAgentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, maxlength: 80 },
    templateId: { type: String, default: '' },
    purpose: { type: String, default: '' },
    systemPrompt: { type: String, default: '' },
    model: { type: String, required: true },
    tags: { type: [String], default: [] },
    icon: { type: String, default: '🤖' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userAgentSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('UserAgent', userAgentSchema);
