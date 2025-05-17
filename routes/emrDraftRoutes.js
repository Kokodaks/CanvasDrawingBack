const express = require('express');
const router = express.Router();
const emrDraftController = require('../controller/emrDraftController');

// AI 분석 내용을 기존 HTP 보고서에 자동 기입
router.post('/auto-fill', emrDraftController.autoFillReportWithAiAnalysis);

module.exports = router;