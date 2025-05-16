const HTPReport = require('../database/mongodb/models/htpReport');

exports.createReport = async (data) => {
  return await HTPReport.create(data);
};

exports.updateReport = async (testId, data) => {
  return await HTPReport.findOneAndUpdate({ testId }, data, {
    new: true,
    overwrite: true,
  });
};

exports.deleteReport = async (testId) => {
  return await HTPReport.findOneAndDelete({ testId });
};
