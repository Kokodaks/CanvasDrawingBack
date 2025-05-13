const express = require('express');
const router = express.Router();
const gptAnalysisController = require('../controller/gptAnalysisController');

// GPT 분석 저장
router.post('/save', gptAnalysisController.saveGptAnalysis);

// GPT 분석 가져오기
router.get('/get', gptAnalysisController.getGptAnalysis);

module.exports = router;
