const HTPReport = require('../database/mongodb/models/htpReport');
const { Tests, Children, Users } = require('../database/mysql/models');
const DrawingQnA = require('../database/mongodb/models/question');

exports.getInitData = async (testId) => {
  const test = await Tests.findByPk(testId);
  if (!test) throw new Error('Test not found');

  const child = await Children.findByPk(test.childid);
  if (!child) throw new Error('Child not found');

  const user = await Users.findByPk(test.userid);
  const qnaDocs = await DrawingQnA.find({ testId });

  const qna = qnaDocs.map(doc => ({
    drawingType: doc.drawingType,
    questions: doc.questions
  }));

  return {
    testId,
    name: child.name,
    gender: child.gender,
    ssn: child.ssn,
    reason: child.counseling_reason,          // 🆕 의뢰사유
    background: child.personal_history_family,  // 🆕 가족배경과 개인력
    testDate: test.completedDate,
    examiner: user?.name || 'unknown',
    qna
  };
};

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
