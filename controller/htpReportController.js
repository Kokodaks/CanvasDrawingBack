const service = require('../service/htpReportService');
// 초기 데이터 조회 (아동 + 검사자 + QnA)
exports.getInitData = async (req, res) => {
  const { testId } = req.params;
  try {
    const data = await service.getInitData(Number(testId));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const data = req.body;
    const report = await service.createReport(data);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const data = req.body;
    const report = await service.updateReport(testId, data);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const report = await service.getReport(testId);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const exists = await service.checkExists(testId);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};