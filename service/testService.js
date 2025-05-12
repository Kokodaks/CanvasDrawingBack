const testRepo = require('../repo/testRepo');
const childRepo = require('../repo/childRepo');
const drawingQnARepo = require('../repo/drawingQnARepo');


exports.createTest = async (testData) => {
    const { userid, childid } = testData;

    const child = await childRepo.findChildByIdAndUser(childid, userid);
    if (!child) {
        throw new Error('User does not own this child');
    }

    // 🔍 기존에 완료되지 않은 테스트가 있는지 확인
    const existingTests = await testRepo.findUnfinishedTestByChildId(childid);
    if (existingTests.length > 0) {
        throw new Error('이미 생성한 검사가 있습니다.');
    }

    // 🔥 childname과 ssn 자동으로 넣기
    testData.childname = child.name;
    testData.ssn = child.ssn;

    return await testRepo.createTest(testData);
};




exports.getAllTestsByUser = async (userid) => {
    return await testRepo.getAllTestsByUser(userid);
};

exports.getTestsByChild = async (childid) => {
    return await testRepo.getTestsByChild(childid);
};

exports.deleteTest = async (id, userid) => {
    return await testRepo.deleteTestByIdAndUser(id, userid);
};
exports.getTestBySsn = async (name, ssn) => {
    const child = await childRepo.findChildByNameAndSsn(name, ssn);
    if (!child) throw new Error('Child not found');

    return await testRepo.findUnfinishedTestByChildId(child.id);
};

exports.markTestAsCompleted = async (testid) => {
    return await testRepo.updateTestAsCompleted(testid);
};


exports.createQnA = async (testId, childId, drawingType) => {
    return await drawingQnARepo.createQnA(testId, childId, drawingType);
  };

exports.addQnA = async (testId, drawingType, question, answer) => {
    const doc = await drawingQnARepo.findByTestIdAndType(testId, drawingType);
    if (!doc) throw new Error('Drawing QnA not found');
  
    const questionObj = {
      question,
      answer,
      timestamp: new Date()
    };
  
    return await drawingQnARepo.pushQuestion(doc._id, questionObj);
  };
  
  exports.getQnAByTestId = async (testId, drawingType) => {
    return await drawingQnARepo.findByTestIdAndType(testId, drawingType);
  };