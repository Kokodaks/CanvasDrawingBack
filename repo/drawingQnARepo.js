const DrawingQnA = require('../database/mongodb/models/question');


exports.createQnA = async (testId, childId, drawingType) => {
    const existing = await DrawingQnA.findOne({ testId, drawingType });
    if (existing) throw new Error('QnA already exists for this test');
  
    const newQnA = new DrawingQnA({
      testId,
      childId,
      drawingType,
      questions: []
    });
  
    return await newQnA.save();
  };

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
