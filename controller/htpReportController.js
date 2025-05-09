const service = require('../service/htpReportService');


//보고서 생성
exports.createReport = async (req, res) => {
  try {
    const report = await service.createReport(req.body);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//보고서 수정
exports.updateReport = async (req, res) => {
  const { testId } = req.params;
  try {
    const updated = await service.updateReport(testId, req.body);
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//보고서 삭제
exports.deleteReport = async (req, res) => {
  const { testId } = req.params;
  try {
    const deleted = await service.deleteReport(testId);
    if (!deleted) return res.status(404).json({ error: 'Report not found' });
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
