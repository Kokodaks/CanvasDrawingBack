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

        const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 완성했습니다.
이 그림은 7-13세 아동이 그린 것으로, 심리상담사가 활용할 분석 자료입니다.

**핵심 목표: 각 개별 객체가 실제로 그려진 정확한 시간 찾기**

**좌표 데이터 구조 이해:**
- 배열 형태로 각 획(stroke)이 개별 객체로 저장됨
- 각 stroke 객체의 최상위 레벨에 "strokeStartTime" 필드 존재 (밀리초 단위)
- "strokeOrder" 필드로 그려진 순서 확인 가능
- "points" 배열에 실제 x, y 좌표들이 저장됨
- "isErasing": false인 stroke만 분석 (지우개 제외)

**분석 방법:**
1. **시간 추출**: 각 stroke 객체에서 strokeStartTime 값을 직접 읽어와서 MM:SS로 변환
   - 예: strokeStartTime: 2917 → 2917밀리초 → 00:02 (2.917초 ≈ 3초)
   - 예: strokeStartTime: 7500 → 7500밀리초 → 00:07 (7.5초)

2. **객체 그룹핑**: 
   - strokeOrder 순서와 strokeStartTime을 함께 고려
   - 시간적으로 연속된 stroke들 (5초 이내)을 하나의 드로잉 세션으로 간주
   - points 배열의 좌표를 보고 공간적 연관성 판단

3. **객체 매칭**: 각 드로잉 세션이 이미지의 어떤 객체에 해당하는지 판단
   - 각 객체의 첫 번째 stroke의 strokeStartTime을 해당 객체 시작 시간으로 설정

**객체 식별 대상:** ${objectElements}

**중요 규칙:**
- strokeStartTime 값을 정확히 MM:SS로 변환 (반올림: 2917ms → 00:03)
- 창문 두 개, 눈 두 개 등은 각각 별개의 객체로 구분
- isErasing이 true인 stroke은 무시
- strokeOrder 순서도 함께 고려하여 그려진 흐름 파악

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