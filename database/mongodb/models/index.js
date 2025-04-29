const fs = require('fs');
const path = require('path');

const db = {};

const syncMongoDB = async() =>{
    fs.readdirSync(__dirname)
      .filter(file => file !== 'index.js' && file.endsWith('.js'))
      .forEach(file => {
        const model = require(path.join(__dirname, file));
        db[model.modelName] = model; 
        });
}

module.exports = syncMongoDB;