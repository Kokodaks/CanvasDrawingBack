const mongoose = require('mongoose');

const gptAnalysisSchema = new mongoose.Schema(
  {
    testId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['house', 'tree', 'man', 'woman'],
      required: true,
    },
    events: [
      {
        event_type: {
          type: String,
          enum: ['object', 'repeat', 'hesitation', 'erase', 'emphasis'],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        video_timestamp: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    collection: 'gptAnalysis',
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

module.exports = mongoose.model('GptAnalysis', gptAnalysisSchema);
