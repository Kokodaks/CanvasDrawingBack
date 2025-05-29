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

**중요: 이 작업의 핵심은 각 객체가 그려진 정확한 시간을 찾는 것입니다.**

제공된 좌표 데이터에서 strokeStartTime 값을 밀리초 단위로 분석하여 MM:SS 형식으로 정확히 변환해주세요.

**시간 분석 우선순위:**
1. 좌표 데이터의 각 stroke별 strokeStartTime 값을 정밀 분석
2. 동일한 객체를 구성하는 여러 stroke들 중 가장 빠른 시작 시간 선택
3. 밀리초를 MM:SS 형식으로 정확히 변환 (예: 2340ms → 00:02, 7890ms → 00:07)
4. 시간 순서대로 객체 나열

**객체 식별 대상:** ${objectElements}

**분석 단계:**
1. 먼저 좌표 데이터에서 모든 strokeStartTime 값들을 추출
2. 공간적 위치와 연결성을 기반으로 stroke들을 객체별로 그룹화
3. 각 객체 그룹의 최초 strokeStartTime을 해당 객체의 시작 시간으로 설정
4. 객체 특성은 간단히만 기술 (예: "지붕 - 상단 삼각형 형태")

**절대 준수사항:**
- strokeStartTime 값을 반드시 정확히 MM:SS로 변환
- 추측이나 대략적인 시간 배치 금지
- 심리적 해석 금지, 오직 객관적 관찰만

응답은 다음 JSON 형식으로 작성해주세요. JSON 마크다운 없이 순수 JSON만 응답해주세요:
{
  "objectiveSummary": "전체 그림에 대한 간략한 요약",
  "objectsTimestamps": [
    {
      "timestamp": "MM:SS",
      "event": "객체명 - 간단한 특성",
      "type": "object"
    }
  ],
  "timeAnalysisNote": "시간 분석 과정에서 발견한 주요 패턴이나 특이사항"
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