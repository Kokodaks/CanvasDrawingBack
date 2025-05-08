const testRepo = require('../repo/testRepo');
const childRepo = require('../repo/childRepo');

exports.createTest = async (testData) => {
    const { userid, childid } = testData;

    const ownsChild = await childRepo.findChildByIdAndUser(childid, userid);
    if (!ownsChild) {
        throw new Error('User does not own this child');
    }

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