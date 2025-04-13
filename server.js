const port = 3000;
const express = require('express');
const cors = require('cors');
const app = express();

const { generateSVGPaths, wrapInSVG } = require('./service/svgService');

app.use(cors());
app.use(express.json());

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

app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중`);
});
