const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: [true, 'Name required'], trim: true },
    provider: { type: String, required: [true, 'Provider required'], trim: true },
    providerColor: { type: String, default: '#4f8ef7' },
    categories: { type: [String], required: true, validate: [(v) => v.length > 0, 'At least one category required'] },
    description: { type: String, required: true, maxlength: 1000 },
    contextWindow: { type: Number, default: null },
    pricing: {
      input: { type: Number, default: 0 },
      output: { type: Number },
      unit: { type: String, default: 'per 1M tokens' },
      tier: { type: String, enum: ['free', 'budget', 'mid', 'premium'], default: 'mid' },
    },
    strengths: { type: [String], default: [] },
    limitations: { type: [String], default: [] },
    scores: {
      reasoning: { type: Number, min: 0, max: 100, default: 0 },
      coding: { type: Number, min: 0, max: 100, default: 0 },
      creativity: { type: Number, min: 0, max: 100, default: 0 },
      speed: { type: Number, min: 0, max: 100, default: 0 },
      multimodal: { type: Number, min: 0, max: 100, default: 0 },
      contextHandling: { type: Number, min: 0, max: 100, default: 0 },
      costEfficiency: { type: Number, min: 0, max: 100, default: 0 },
    },
    releaseDate: { type: String },
    openSource: { type: Boolean, default: false },
    /** Research / academic-only licence (not general commercial API) */
    researchOnly: { type: Boolean, default: false },
    apiAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

aiModelSchema.index({ name: 'text', provider: 'text', description: 'text' });
aiModelSchema.index({ categories: 1 });
aiModelSchema.index({ 'pricing.tier': 1 });

module.exports = mongoose.model('AIModel', aiModelSchema);
