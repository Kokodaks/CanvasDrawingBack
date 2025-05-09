const db = require('../database/mysql/models');
const { Tests, Children } = db;

exports.createTest = async (data) => {
    return await Tests.create(data);
};

exports.getAllTestsByUser = async (userid) => {
    return await Tests.findAll({ where: { userid } });
};

exports.getTestsByChild = async (childid) => {
    return await Tests.findAll({ where: { childid } });
};

exports.deleteTestByIdAndUser = async (id, userid) => {
    const deleted = await Tests.destroy({
        where: {
            id,
            userid
        }
    });
    return deleted > 0;
};

exports.findUnfinishedTestByChildId = async (childid) => {
    return await db.Tests.findAll({
        where: {
            childid,
            isCompleted: false
        }
    });
};

exports.updateTestAsCompleted = async (id) => {
    const [affectedRows] = await db.Tests.update(
        {
            isCompleted: true,
            completedDate: new Date()
        },
        { where: { id } }
    );
    return affectedRows > 0;
};
const DrawingQnA = require('../database/mongodb/models/question');

exports.findByTestIdAndType = async (testId, drawingType) => {
  return await DrawingQnA.findOne({ testId, drawingType });
};

exports.pushQuestion = async (id, questionObj) => {
  return await DrawingQnA.findByIdAndUpdate(
    id,
    { $push: { questions: questionObj } },
    { new: true }
  );
};

