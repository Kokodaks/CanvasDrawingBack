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

**중요한 전제: 각 객체는 연속적인 획으로 한번에 그려집니다.**

**매우 중요한 규칙들:**
1. 각 stroke는 단 하나의 객체에만 속합니다 - 중복 사용 절대 금지
2. 밀리초 변환 공식: strokeStartTime ÷ 1000 = 초, 그 다음 MM:SS 형식
   - 예: 2917ms ÷ 1000 = 2.917초 = 00:02 (소수점 버림)
   - 예: 7500ms ÷ 1000 = 7.5초 = 00:07
   - 예: 12340ms ÷ 1000 = 12.34초 = 00:12

**정확한 분석 방법:**
1. **이미지에서 객체 정확한 좌표 추정**:
   - 이미지를 보고 각 객체가 정확히 어느 x, y 좌표 범위에 위치하는지 측정
   - 예시: 지붕이 x: 150-350, y: 80-180 범위에 위치한다고 추정
   - 예시: 문이 x: 220-260, y: 300-380 범위에 위치한다고 추정
   - 모든 식별 가능한 객체에 대해 정확한 좌표 범위 설정

2. **시간순 stroke 정렬**:
   - 모든 stroke를 strokeStartTime 순서로 정렬
   - strokeOrder도 함께 확인하여 그려진 순서 파악

3. **정밀한 좌표 기반 매칭**:
   - 정렬된 순서대로 각 stroke의 points 배열을 분석
   - 해당 stroke의 모든 x, y 좌표가 어느 객체의 좌표 범위에 속하는지 정확히 비교
   - stroke의 대부분 좌표가 특정 객체 범위 내에 있으면 해당 객체로 매칭
   - 여러 객체 범위에 걸치는 stroke의 경우 더 많은 좌표가 포함된 객체로 매칭

4. **각 객체의 시작 시간 결정**:
   - 동일한 객체로 매칭된 stroke들 중에서 가장 작은 strokeStartTime 찾기
   - 그 값을 MM:SS로 변환하여 해당 객체의 시작 시간으로 설정

**분석 핵심:**
- 이미지 기반 정확한 좌표 범위 추정 (내부 분석용)
- stroke points와 객체 좌표 범위의 정밀한 비교 매칭
- 좌표 기반 정확한 객체 할당을 통한 시간 추출

**절대 중요: 응답에는 구체적인 좌표 수치나 범위를 포함하지 마세요. 오직 내부 매칭 분석용으로만 사용하고, 응답은 "객체명 - 간단한 특성" 형태로만 작성하세요.**

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