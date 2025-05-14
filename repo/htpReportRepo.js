const { Tests, Children, Users } = require('../database/mysql/models');
const DrawingQnA = require('../database/mongodb/models/question'); // 파일명에 따라 조정

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
    birth: child.birth,
    age: child.age,
    testDate: test.completedDate,
    examiner: user?.name || 'unknown',
    qna
  };
};
