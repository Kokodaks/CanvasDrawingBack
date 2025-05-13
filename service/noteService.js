const noteRepo = require('../repo/noteRepo');

exports.addNote = async (testId, type, timestamp, content) => {
  return await noteRepo.addNote({ testId, type, timestamp, content });
};

exports.getNotes = async (testId, type) => {
  return await noteRepo.getNotesByTestAndType(testId, type);
};
exports.updateNoteById = async (testId, type, noteId, content) => {
  return await noteRepo.updateNoteById({ testId, type, noteId, content });
};

