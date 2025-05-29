// service/aiService.js (정규화 + mm:ss + 중심좌표 반영 완전판)

const fs   = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const gptAnalysisService = require('../service/gptAnalysisService');

// ────────────────────────────────────────────────────────────────────────────────
// OpenAI 초기화
// ────────────────────────────────────────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ────────────────────────────────────────────────────────────────────────────────
//  유틸 함수
// ────────────────────────────────────────────────────────────────────────────────
const msToMMSS = ms => {
  const sec = Math.floor(ms / 1000);
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
};

const getBBox = points => {
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
  points.forEach(p => {
    if (p.x < xMin) xMin = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.x > xMax) xMax = p.x;
    if (p.y > yMax) yMax = p.y;
  });
  return { xMin, yMin, xMax, yMax };
};

const normaliseStrokes = rawJson => {
  // isErasing === true 제거 & 필수 필드 체크
  const validStrokes = (rawJson.strokes || []).filter(s => !s.isErasing && typeof s.t === 'number');
  if (validStrokes.length === 0) return rawJson; // 예외

  const t0 = Math.min(...validStrokes.map(s => s.t));

  validStrokes.forEach(s => {
    // 기본 시간 필드
    s.strokeStartTime = s.t - t0;
    s.mmss            = msToMMSS(s.strokeStartTime);

    // 중심 좌표(Cx, Cy)
    const { xMin, yMin, xMax, yMax } = getBBox(s.points);
    s.cx = Math.round((xMin + xMax) / 2);
    s.cy = Math.round((yMin + yMax) / 2);
  });

  return { ...rawJson, strokes: validStrokes };
};

// ────────────────────────────────────────────────────────────────────────────────
//  파일 변환
// ────────────────────────────────────────────────────────────────────────────────
exports.convertFinalToFile = async (finalImageBuffer, finalDrawingBuffer, testId, type) => {
  try {
    const dir = path.join(__dirname, '..', 'ai_uploads', String(testId), type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const imgPath = path.join(dir, 'finalImg.png');
    const jsonPath = path.join(dir, 'finalDrawing.json');

    const parsedJson = JSON.parse(finalDrawingBuffer.toString('utf-8'));
    fs.writeFileSync(imgPath, finalImageBuffer);
    fs.writeFileSync(jsonPath, JSON.stringify(parsedJson, null, 2));

    console.log('✅ [convertFinalToFile] saved →', dir);
  } catch (error) {
    console.error({ msg: 'convertFinalToFile', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  최종 그림 처리 & GPT 전송
// ────────────────────────────────────────────────────────────────────────────────
exports.sendFinalToOpenAi = async (finalImageBuffer, finalDrawingBuffer, testId, type) => {
  try {
    // 1) 이미지 & 드로잉 JSON 준비 -------------------------------------------------
    let finalImageBase64, drawingJson;

    if (process.env.NODE_ENV === 'production') {
      finalImageBase64 = finalImageBuffer.toString('base64');
      drawingJson      = JSON.parse(finalDrawingBuffer.toString());
    } else {
      await this.convertFinalToFile(finalImageBuffer, finalDrawingBuffer, testId, type);
      const imgPath  = path.join(__dirname, `../ai_uploads/${testId}/${type}/finalImg.png`);
      const jsonPath = path.join(__dirname, `../ai_uploads/${testId}/${type}/finalDrawing.json`);
      finalImageBase64 = fs.readFileSync(imgPath).toString('base64');
      drawingJson      = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }

    // 2) 드로잉 JSON 정규화 --------------------------------------------------------
    const normalisedJson = normaliseStrokes(drawingJson);

    // 3) 프롬프트 세팅 -------------------------------------------------------------
    const { objectElements, objectDescription } = (() => {
      switch (type) {
        case 'house':  return { objectElements: '지붕, 벽, 문, 창문, 굴뚝, 연기, 울타리 등',               objectDescription: '집'   };
        case 'tree':   return { objectElements: '기둥, 수관, 가지, 뿌리, 나뭇잎, 꽃, 열매 등',           objectDescription: '나무' };
        case 'man':    return { objectElements: '머리, 얼굴, 팔, 다리, 옷, 신발, 액세서리 등',          objectDescription: '남자' };
        case 'woman':  return { objectElements: '머리, 얼굴, 팔, 다리, 치마/드레스, 신발, 액세서리 등', objectDescription: '여자' };
        default:       return { objectElements: '', objectDescription: '' };
      }
    })();

    const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 완성했습니다.\n` +
      `각 stroke 객체에는 이미 mmss(00:07 형태)와 중심 좌표(cx, cy)가 포함돼 있습니다.\n` +
      `mmss 값을 그대로 사용해 각 객체의 최초 시작 시간을 결정하세요.\n\n` +
      `**분석 절차(시간 변환 불필요)**\n` +
      `1. 이미지 관찰 → ${objectElements} 위치 짐작(중심 좌표)\n` +
      `2. 드로잉 JSON의 stroke.cx, stroke.cy와 비교해 매칭\n` +
      `3. 매칭된 stroke 그룹 중 가장 이른 mmss를 객체 시작 시간으로 채택\n` +
      `4. 결과 JSON으로 반환(아래 포맷)\n\n` +
      `반환 형식(순수 JSON):\n` +
      `{"objectiveSummary":"...","objectsTimestamps":[{"timestamp":"MM:SS","event":"객체명","x":123,"y":456,"type":"object"}]}`;

    // 4) GPT 호출 -----------------------------------------------------------------
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text',      text: prompt },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${finalImageBase64}` } },
            { type: 'text',      text: `좌표 데이터:\n${JSON.stringify(normalisedJson, null, 2)}` }
          ]
        }
      ]
    });

    // 5) GPT 응답 처리 ------------------------------------------------------------
    const rawContent = gptRes.choices[0].message.content;
    const jsonString = (rawContent.match(/```json\s*([\s\S]*?)\s*```/) || [])[1] || rawContent;

    let parsed;
    try { parsed = JSON.parse(jsonString); } catch (e) {
      console.error('❌ JSON 파싱 실패', e.message);
      parsed = { error: 'parse error', raw: jsonString };
    }

    const events = (parsed.objectsTimestamps || []).map(obj => ({
      event_type: 'object',
      description: obj.event,
      video_timestamp: obj.timestamp,
      x: obj.x, y: obj.y
    }));

    console.log('📝 저장할 이벤트:', events.length);

    // 6) DB 저장 ------------------------------------------------------------------
    if (events.length) {
      const saveRes = await gptAnalysisService.saveGptAnalysis(parseInt(testId, 10), type, events);
      console.log('✅ DB 저장 완료');
      return { success: true, data: saveRes, gpt: parsed };
    }
    return { success: false, message: '이벤트 없음', gpt: parsed };
  } catch (err) {
    console.error('❌ sendFinalToOpenAi 오류:', err.message);
    throw new Error('최종 그림 처리 실패');
  }
};
