const express = require('express');
const router = express.Router();
const controller = require('../controller/htpReportController');

// htp 초기화 정보 (GET /htpReport/init/:testId)
router.get('/init/:testId', controller.getInitData);

// 생성
router.post('/', controller.createReport);

// 수정 (전체 덮어쓰기)
router.put('/:testId', controller.updateReport);

// gpt 답변 수정
router.put('/gpt/:testId', controller.updateReport);

// 조회
router.get('/:testId', controller.getReport);

// 존재 여부 확인
router.get('/check/:testId', controller.checkExists);
module.exports = router;
