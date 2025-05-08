const port = 3000;
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

const { generateSVGPaths, wrapInSVG } = require('./service/svgService');

app.use(cors());
app.use(express.json());

//db 연동
const sequelize = require('./database/mysql/mysqlConfig.js');
const connectMongoDB = require('./database/mongodb/mongdbConfig.js');
connectMongoDB();


app.get('/', (req, res) => {
  res.send('서버가 잘 실행되고 있어!');
});

app.get('/ping', (req, res) => {
    res.send('pong!');
});

let strokeData;
app.post('/upload', (req, res) => {
    strokeData = req.body;
    console.log('받은 데이터: ', req.body);
    res.send('ok');
});

//타임랩스용 원본 JSON 데이터
app.get('/json', (req, res) => {
  if (!strokeData) {
    return res.status(404).json({ error: 'No stroke data' });
  }
  res.json(strokeData);
});

//정적 그림 svg 데이터
app.get('/svg', (req, res) => {
    if(!strokeData){
        return res.status(404).send('No stroke data available.');
    }
    const paths = generateSVGPaths(strokeData);
    const svg = wrapInSVG(paths);

    console.log('생성된 SVG:\n', svg);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
});

app.use('/video', require('./routes/videoRoutes.js'));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
// app.use('/child', require('./routes/childRoutes.js'));
app.use('/user', require('./routes/userRoutes.js'))

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
