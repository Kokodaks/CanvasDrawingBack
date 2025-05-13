const mongoose = require('mongoose');

const gptAnalysisSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  type: {
    type: String,
    enum: ['house', 'tree', 'man', 'woman'],
    required: true,
  },
  event_type: {
    type: String,
    enum: ['object', 'repeat', 'hesitation', 'erase', 'emphasis'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  video_timestamp: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GptAnalysis', gptAnalysisSchema);
