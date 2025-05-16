const mysqlDB = require('./database/mysql/models');
const connectMongoDB = require('./database/mongodb/mongdbConfig.js');
const syncMongoDB = require('./database/mongodb/models/index.js');

//mysql 스키마들을 한번에 담은 db 객체를 sequelize.sync()해서 실제 mysql db에 적용

const connectMongoDB = require('./database/mongodb/mongdbConfig.js');
const syncMongoDB = require('./database/mongodb/models/index.js');

//mysql 스키마들을 한번에 담은 db 객체를 sequelize.sync()해서 실제 mysql db에 적용
(async () => {
    await mysqlDB.sequelize.sync({force: true});
})();

const mongoDB = async() => {
    await connectMongoDB();
    
    //mongodb models의 index.js 모듈 실행
    await syncMongoDB();
};

mongoDB();