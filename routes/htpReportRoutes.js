const express = require('express');
const router = express.Router();
const controller = require('../controller/htpReportController');

// htp 초기화 정보 (GET /htpReport/init/:testId)
router.get('/init/:testId', controller.getInitData);

// 생성
router.post('/', controller.createReport);

// 수정 (전체 덮어쓰기)
router.put('/:testId', controller.updateReport);

// 삭제
router.delete('/:testId', controller.deleteReport);

module.exports = router;
