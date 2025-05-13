const Note = require('../database/mongodb/models/note');

exports.addNote = async ({ testId, type, timestamp, content }) => {
  return await Note.findOneAndUpdate(
    { testId, type },
    {
      $push: {
        notes: {
          timestamp, // 예: "21:30"
          content
        }
      }
    },
    { upsert: true, new: true }
  );
};

exports.getNotesByTestAndType = async (testId, type) => {
  return await Note.findOne({ testId, type });
};

exports.updateNoteById = async ({ testId, type, noteId, content }) => {
  return await Note.findOneAndUpdate(
    {
      testId,
      type,
      'notes._id': noteId,
    },
    {
      $set: {
        'notes.$.content': content
      }
    },
    { new: true }
  );
};
