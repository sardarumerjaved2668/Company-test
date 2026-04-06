const mongoose = require('mongoose');

const discoverItemSchema = new mongoose.Schema(
  {
    lab: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    publishDate: { type: Date, required: true },
    category: {
      type: String,
      default: 'reasoning',
      enum: ['reasoning', 'multimodal', 'alignment', 'efficiency', 'open_weights'],
    },
    arxivId: { type: String, default: '' },
    arxivUrl: { type: String, default: '' },
    authors: { type: [String], default: [] },
    keyFindings: { type: [String], default: [] },
    /** { name, icon } or legacy string */
    modelsReferenced: { type: [mongoose.Schema.Types.Mixed], default: [] },
    impactLevel: {
      type: String,
      default: 'Medium',
      enum: ['Low', 'Medium', 'High'],
    },
    impactDescription: { type: String, default: '' },
    /** @deprecated use impactLevel + impactDescription */
    impact: { type: String, default: '' },
    citation: { type: String, default: '' },
  },
  { timestamps: true }
);

discoverItemSchema.index({ publishDate: -1 });
discoverItemSchema.index({ category: 1, publishDate: -1 });

module.exports = mongoose.model('DiscoverItem', discoverItemSchema);
