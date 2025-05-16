const express = require('express');
const router = express.Router();
const testController = require('../controller/testController'); 

//테스트 생성
router.post('/createTest', testController.createTest);

//유저의 모든 테스트 반환
router.get('/getAllTestsByUser', testController.getAllTestsByUser); 

//테스트 삭제
router.delete('/deleteTest', testController.deleteTest);

//ssn으로 테스트 조회
router.get('/getTestBySsn', testController.getTestBySsn);
module.exports = router;

//QnA 생성
router.post('/createQnA', testController.createQnA);

//QnA 추가
router.post('/addQnA', testController.addQnA);

//TestId로 QnA불러오기
router.get('/getQnAByTestId', testController.getQnAByTestId);

module.exports = router;