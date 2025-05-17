const port = 5000;
const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//db 연동

const env = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({path: env});
console.log(`✅ Loaded environment from ${env}`);

const sequelize = require('./database/mysql/mysqlConfig.js');
const connectMongoDB = require('./database/mongodb/mongdbConfig.js');
connectMongoDB();

app.use('/video', require('./routes/videoRoutes.js'));
app.use('/reconstruction', require('./routes/reconRoutes.js'));
app.use('/child', require('./routes/childRoutes.js'));
app.use('/user', require('./routes/userRoutes.js'));
app.use('/test', require('./routes/testRoutes.js'));
app.use('/htpReport', require('./routes/htpReportRoutes.js'));
app.use('/ai', require('./routes/aiRoutes.js'));
app.use('/note', require('./routes/noteRoutes.js'));
// gpt답변 저장
app.use('/gpt', require('./routes/gptAnalysisRoutes.js')); 
app.use('/emrDraft', require('./routes/emrDraftRoutes.js')); 


app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
