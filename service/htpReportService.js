const repo = require('../repo/htpReportRepo');

exports.getInitData = async (testId) => {
  return await repo.getInitData(testId);
};

exports.createReport = async (data) => {
  return await repo.createReport(data);
};

exports.updateReport = async (testId, data) => {
  return await repo.updateReportByTestId(testId, data);
};

exports.getReport = async (testId) => {
  return await repo.getReportByTestId(testId);
};

exports.checkExists = async (testId) => {
  const result = await repo.existsByTestId(testId);
  return result !== null;
};