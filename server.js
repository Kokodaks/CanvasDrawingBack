const port = 3000;
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//db 연동
const sequelize = require('./database/mysql/mysqlConfig.js');
const connectMongoDB = require('./database/mongodb/mongdbConfig.js');
connectMongoDB();

app.use('/video', require('./routes/videoRoutes.js'));
app.use('/reconstruction', require('./routes/reconRoutes.js'));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
// app.use('/child', require('./routes/childRoutes.js'));
app.use('/user', require('./routes/userRoutes.js'))

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
