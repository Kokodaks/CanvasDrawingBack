const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const drawingQnASchema = new mongoose.Schema({
  testId: {
    type: Number,
    required: true
  },
  childId: {
    type: Number,
    required: true
  },
  drawingType: {
    type: String,
    enum: ['house', 'tree', 'man', 'woman'],
    required: true
  },
  questions: {
    type: [questionSchema],
    required: true
  }
}, {
  collection: 'DrawingQnAs',
  timestamps: true
});

const DrawingQnA = mongoose.model('DrawingQnA', drawingQnASchema);

module.exports = DrawingQnA;
