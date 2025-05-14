const repo = require('../repo/htpReportRepo');

exports.getInitData = async (testId) => {
  return await repo.getInitData(testId);
};

exports.createReport = async (data) => {
  return await repo.createReport(data);
};

exports.updateReport = async (testId, data) => {
  return await repo.updateReport(testId, data);
};

exports.deleteReport = async (testId) => {
  return await repo.deleteReport(testId);
};
