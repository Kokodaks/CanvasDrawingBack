'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const sequelize = require(__dirname + '/../mysqlConfig');
const db = {};

//디렉토리 내부에 모든 스키마 파일들을 db에 로드. 
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

  console.log("DB Models: ", Object.keys(db));

//각 모듈마다 db[modelName] associate 메소드가 있다면 해당 메소드에 db 객체를 보내 관계를 db 객체에 설정.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//db 객체에 sequelize와 Sequelize클래스를 포함시킨다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;