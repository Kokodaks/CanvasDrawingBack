const testService = require('../service/testService');

//검사 생성
exports.createTest = async (req, res) => {
    try {
        const test = await testService.createTest(req.body);
        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//유저의 모든 검사사 반환
exports.getAllTestsByUser = async (req, res) => {
    try {
        const { userid } = req.query;
        const tests = await testService.getAllTestsByUser(userid);
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//아이id로 검사 찾기
exports.getTestsByChild = async (req, res) => {
    try {
        const { childid } = req.params;
        const tests = await testService.getTestsByChild(childid);
        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//해당 유저의 테스트 삭제
exports.deleteTest = async (req, res) => {
    try {
        const { id, userid } = req.body;
        const result = await testService.deleteTest(id, userid);
        if (!result) return res.status(403).json({ error: 'Unauthorized or not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//주민등록 번호로 Test 반환 - 앱로그인
exports.getTestBySsn = async (req, res) => {
    try {
        const { name, ssn } = req.query;
        const result = await testService.getTestBySsn(name, ssn);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 검사 완료시 요청
exports.markTestAsCompleted = async (req, res) => {
    try {
        const { testid } = req.body;
        const updated = await testService.markTestAsCompleted(testid);
        if (!updated) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json({ message: 'Test marked as completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//질문 생성 요청
exports.createQnA = async (req, res) => {
    try {
      const { testId, childId, drawingType } = req.body;
      if (!testId || !childId || !drawingType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const result = await testService.createQnA(testId, childId, drawingType);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  //질문 답변 저장
exports.addQnA = async (req, res) => {
    try {
      const { testId, drawingType, question, answer } = req.body;
      const result = await testService.addQnA(testId, drawingType, question, answer);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  //testid로 질문찾기
  exports.getQnAByTestId = async (req, res) => {
    try {
      const { testId, drawingType } = req.query;
      const result = await testService.getQnAByTestId(testId, drawingType);
      if (!result) return res.status(404).json({ message: 'QnA not found' });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };