const fs = require('fs');
const path = require('path');
const {OpenAI} = require('openai');
const gptAnalysisService = require('../service/gptAnalysisService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.convertFinalToFile = async(finalImageBuffer, finalDrawingBuffer, testId, type) => {
    try {
        const dir = path.join(__dirname, '..', 'ai_uploads', String(testId), type);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const finalImgPath = path.join(dir, 'finalImg.png');
        const finalDrawingPath = path.join(dir, 'finalDrawing.json');
        const parsedJson = JSON.parse(finalDrawingBuffer.toString('utf-8'));

        fs.writeFileSync(finalImgPath, finalImageBuffer);
        fs.writeFileSync(finalDrawingPath, JSON.stringify(parsedJson, null, 2));
        console.log("Successfully converted and saved to /ai_uploads");
    } catch (error) {
        console.log({ message: "aiService convertFinalToFile", error: error.message });
    }
};

exports.sendFinalToOpenAi = async(finalImageBuffer, finalDrawingBuffer, testId, type) => {
    try {
        let finalImage;
        let finalDrawingJson;

        if (process.env.NODE_ENV === 'production') {
            finalImage = finalImageBuffer.toString('base64');
            finalDrawingJson = JSON.parse(finalDrawingBuffer.toString());
        } else {
            await this.convertFinalToFile(finalImageBuffer, finalDrawingBuffer, testId, type);
            const finalImgPath = path.join(__dirname, `../ai_uploads/${testId}/${type}/finalImg.png`);
            const finalDrawingPath = path.join(__dirname, `../ai_uploads/${testId}/${type}/finalDrawing.json`);
            finalImage = fs.readFileSync(finalImgPath).toString('base64');
            finalDrawingJson = JSON.parse(fs.readFileSync(finalDrawingPath, 'utf-8'));
        }

        let objectElements = '';
        let objectDescription = '';
        switch (type) {
            case 'house':
                objectElements = '지붕, 벽, 문, 창문, 굴뚝, 연기, 울타리, 길, 연못, 산, 나무, 꽃, 잔디, 태양 등';
                objectDescription = '집';
                break;
            case 'tree':
                objectElements = '기둥, 수관, 가지, 뿌리, 나뭇잎, 꽃, 열매, 그네, 새, 다람쥐, 구름, 달, 별 등';
                objectDescription = '나무';
                break;
            case 'man':
                objectElements = '머리, 얼굴(눈, 코, 입, 귀), 머리카락, 목, 상체, 팔, 손, 다리, 발, 옷(단추, 주머니, 벨트), 신발, 액세서리(모자, 안경) 등';
                objectDescription = '남자';
                break;
            case 'woman':
                objectElements = '머리, 얼굴(눈, 코, 입, 귀), 머리카락, 목, 상체, 팔, 손, 다리, 발, 옷(단추, 주머니, 치마, 드레스), 신발, 액세서리(모자, 귀걸이, 목걸이) 등';
                objectDescription = '여자';
                break;
        }

        const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 그렸습니다.
각 객체가 언제 시작되었는지 정확한 시간을 찾는 것이 목표입니다.

**핵심 규칙 - 객체의 연속성:**
🔴 **절대 규칙: 각 객체는 반드시 연속된 획들로만 구성됩니다**
- 사용자는 한 객체를 완전히 그린 후 다음 객체로 넘어갑니다
- 같은 객체의 획들은 strokeIndex가 연속적이어야 합니다 (예: 1,2,3,4)
- 중간에 다른 획이 끼어있으면 절대 같은 객체가 아닙니다 (예: 1,2,5,6 ❌)
- 예시: strokeIndex 1,2,3→지붕, 4,5,6,7→벽, 8,9→문 (연속적 ✅)
- 잘못된 예시: strokeIndex 1,3,5→지붕 (2,4가 끼어있음 ❌)

**매우 중요한 추가 규칙들:**
1. 각 stroke는 단 하나의 객체에만 속합니다 - 중복 사용 절대 금지
2. 밀리초 변환 공식: strokeStartTime ÷ 1000 = 초, 그 다음 MM:SS 형식
   - 예: 2917ms ÷ 1000 = 2.917초 = 00:02 (소수점 버림)
   - 예: 7500ms ÷ 1000 = 7.5초 = 00:07
   - 예: 12340ms ÷ 1000 = 12.34초 = 00:12

**정확한 분석 방법:**
1. **strokeIndex 순서대로 분석 시작**:
   - 반드시 strokeIndex 0부터 순차적으로 분석
   - 각 stroke의 형태와 위치를 파악
   - 연속된 stroke들이 하나의 객체를 형성하는지 판단

2. **연속성 기반 객체 그룹핑**:
   - 연속된 strokeIndex들을 묶어서 객체 후보군 생성
   - 예: [0,1,2], [3,4,5,6], [7,8] 등으로 그룹화
   - 각 그룹이 실제로 하나의 완성된 객체인지 확인

3. **객체 식별 및 검증**:
   - 각 연속 그룹의 stroke들이 모여서 의미있는 객체를 만드는지 확인
   - 그룹의 형태와 위치를 보고 어떤 객체인지 판단
   - 예시 판단 기준:
     * 상단의 연속된 삼각형+사각형 stroke들 → 지붕+벽 (집의 일부)
     * 하단 중앙의 연속된 작은 사각형 stroke들 → 문
     * 상단의 연속된 작은 사각형 stroke들 → 창문

4. **시간 추출**:
   - 각 객체 그룹의 첫 번째 stroke의 strokeStartTime 사용
   - MM:SS로 변환하여 해당 객체의 시작 시간으로 기록

**분석 절차:**
Step 1: strokeIndex 0번부터 순차적으로 좌표와 형태 파악
Step 2: 연속된 stroke들을 그룹으로 묶기 (중간에 빠진 번호 없이)
Step 3: 각 그룹이 완성된 객체인지 확인
Step 4: 객체명 결정 및 시작 시간 계산

**금지사항:**
❌ strokeIndex가 불연속인 stroke들을 같은 객체로 분류
❌ 하나의 stroke를 여러 객체에 중복 할당
❌ 객체 분석 과정에서 좌표나 형태 분석 과정을 응답에 포함

**가능한 객체 요소들:**
${objectElements}

응답은 다음 JSON 형식으로 작성해주세요. JSON 마크다운 없이 순수 JSON만 응답해주세요:
{
  "objectiveSummary": "전체 그림에 대한 간략한 요약",
  "objectsTimestamps": [
    {
      "timestamp": "MM:SS",
      "event": "객체명 - 간단한 특성",
      "type": "object"
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/png;base64,${finalImage}` } },
                        { type: "text", text: `좌표 데이터:\n${JSON.stringify(finalDrawingJson, null, 2)}` }
                    ]
                }
            ],
            max_tokens: 1000,
        });

        const responseContent = response.choices[0].message.content;
        const cleanedJsonString = extractJsonFromMarkdown(responseContent);
        const parsedResponse = parseJSONResponse(cleanedJsonString);
        const events = [];
        if (parsedResponse.objectsTimestamps && Array.isArray(parsedResponse.objectsTimestamps)) {
            for (const obj of parsedResponse.objectsTimestamps) {
                events.push({
                    event_type: 'object',
                    description: obj.event,
                    video_timestamp: obj.timestamp
                });
            }
        }

        console.log(`저장할 이벤트 데이터 수: ${events.length}`);
        if (events.length > 0) console.log("첫 번째 이벤트:", JSON.stringify(events[0], null, 2));

        return saveToGptAnalysis(events, type, testId, parsedResponse);
    } catch (err) {
        console.error("aiService sendFinalToOpenAi 최종 그림 처리 오류 :", err.message);
        throw new Error(`최종 그림 처리 실패 : ${err.message}`);
    }
};

function extractJsonFromMarkdown(responseContent) {
    const match = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
    return match ? match[1] : responseContent;
}

function parseJSONResponse(cleanedJsonString) {
    try {
        return JSON.parse(cleanedJsonString);
    } catch (err) {
        console.error("JSON 파싱 오류:", err.message);
        return { error: "JSON 파싱 실패", raw: cleanedJsonString };
    }
}

async function saveToGptAnalysis(events, type, testId, parsedResponse) {
    if (events.length > 0) {
        try {
            const numericTestId = parseInt(testId, 10);
            const savedData = await gptAnalysisService.saveGptAnalysis(numericTestId, type, events);
            console.log("aiService saveToGptAnalysis 저장 성공 :", savedData);
            return { success: true, message: "그림 분석 및 저장 완료", data: savedData, originalResponse: parsedResponse };
        } catch (err) {
            console.error("데이터베이스 저장 오류:", err.message);
            throw new Error(`데이터베이스 저장 실패 : ${err.message}`);
        }
    } else {
        console.warn("저장할 이벤트 데이터가 없습니다");
    }
}