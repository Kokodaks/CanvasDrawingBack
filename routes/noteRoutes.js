const express = require('express');
const router = express.Router();
const noteController = require('../controller/noteController');

router.post('/add', noteController.addNote);
router.get('/', noteController.getNotes);
router.put('/updateById', noteController.updateNoteById);


module.exports = router;
