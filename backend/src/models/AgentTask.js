const mongoose = require('mongoose');

const agentTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAgent', required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    done: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

agentTaskSchema.index({ user: 1, agent: 1, sortOrder: 1 });

module.exports = mongoose.model('AgentTask', agentTaskSchema);
