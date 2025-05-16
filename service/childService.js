const childRepo = require('../repo/childRepo');

exports.createChild = async (childData) => {
    try {
        // ssn + userid 중복 여부 검사
        const exists = await childRepo.findChildBySSNAndUser(childData.ssn, childData.userid);
        if (exists) {
            throw new Error('Child with this SSN already exists for this user.');
        }

        // 새 아동 등록
        return await childRepo.createChild(childData);
    } catch (error) {
        throw new Error('Child creation failed: ' + error.message);
    }
};

exports.getAllChildrenByUser = async (userid) => {
    try {
        return await childRepo.getAllChildrenByUser(userid);
    } catch (error) {
        throw new Error('Failed to get children: ' + error.message);
    }
};


exports.deleteChildBySSNAndUser = async (ssn, userid) => {
    try {
        return await childRepo.deleteChildBySSNAndUser(ssn, userid);
    } catch (error) {
        throw new Error('Failed to delete child: ' + error.message);
    }
};