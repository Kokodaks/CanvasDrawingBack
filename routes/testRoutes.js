const express = require('express');
const router = express.Router();
const testController = require('../controller/testController'); 

router.post('/createTest', testController.createTest);

router.get('/getAllTestsByUser', testController.getAllTestsByUser); 

router.delete('/deleteTest', testController.deleteTest);

router.get('/getTestBySsn', testController.getTestBySsn);
module.exports = router;

router.post('/createQnA', testController.createQnA);
router.post('/addQnA', testController.addQnA);
router.get('/getQnAByTestId', testController.getQnAByTestId);