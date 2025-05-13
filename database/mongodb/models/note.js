const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
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
    notes: [
      {
        timestamp: {
          type: String, 
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    collection: 'notes', 
    timestamps: true,    
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
