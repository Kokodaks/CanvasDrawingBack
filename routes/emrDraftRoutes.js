const express = require('express');
const router = express.Router();
const { setupEmrDraftRoutes } = require('../service/emrDraftService');

// HTP 리포트 관련 라우트 설정
setupEmrDraftRoutes(router);

module.exports = router;