const noteService = require('../service/noteService');

// POST /note/add
exports.addNote = async (req, res) => {
  try {
    const { testId, type, timestamp, content } = req.body;
    if (!testId || !type || !timestamp || !content) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const result = await noteService.addNote(testId, type, timestamp, content);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /note?testId=...&type=...
exports.getNotes = async (req, res) => {
  try {
    const { testId, type } = req.query;
    if (!testId || !type) {
      return res.status(400).json({ error: 'testId와 type을 제공해주세요.' });
    }

    const notes = await noteService.getNotes(testId, type);
    res.status(200).json(notes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /note/updateById
exports.updateNoteById = async (req, res) => {
  try {
    const { testId, type, noteId, content } = req.body;
    if (!testId || !type || !noteId || !content) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    const result = await noteService.updateNoteById(testId, type, noteId, content);
    if (!result) {
      return res.status(404).json({ error: '해당 노트를 찾을 수 없습니다.' });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

