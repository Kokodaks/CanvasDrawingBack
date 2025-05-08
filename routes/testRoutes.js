const express = require('express');
const router = express.Router();
const testController = require('../controller/testController'); 

router.post('/createTest', testController.createTest);

router.get('/getAllTestsByUser', testController.getAllTestsByUser); 

router.delete('/deleteTest', testController.deleteTest);

router.get('/getTestBySsn', testController.getTestBySsn);
module.exports = router;
