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
                objectElements = '지붕, 벽, 문, 창문, 굴뚝, 기타';
                objectDescription = '집';
                break;
            case 'tree':
                objectElements = '기둥, 가지, 수관, 기타';
                objectDescription = '나무';
                break;
            case 'man':
                objectElements = '머리, 얼굴(눈, 코, 입), 몸통, 팔, 다리, 손, 발, 기타';
                objectDescription = '남자';
                break;
            case 'woman':
                objectElements = '머리, 얼굴(눈, 코, 입), 몸통, 팔, 다리, 손, 발, 기타';
                objectDescription = '여자';
                break;
        }

        const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 그렸습니다.
각 객체가 언제 시작되었는지 정확한 시간을 찾는 것이 목표입니다.

**매우 중요한 규칙들:**
1. 각 stroke는 단 하나의 객체에만 속합니다 - 중복 사용 절대 금지
2. 밀리초 변환 공식: strokeStartTime ÷ 1000 = 초, 그 다음 MM:SS 형식
   - 예: 2917ms ÷ 1000 = 2.917초 = 00:02 (소수점 버림)
   - 예: 7500ms ÷ 1000 = 7.5초 = 00:07
   - 예: 12340ms ÷ 1000 = 12.34초 = 00:12

**정확한 분석 방법:**
1. **각 stroke의 형태와 위치 분석**:
   - 각 stroke의 points 배열을 보고 어떤 형태인지 파악 (직선, 곡선, 사각형, 삼각형, 원형 등)
   - stroke의 시작점과 끝점, 전체적인 방향성 확인
   - 전체 그림에서 해당 stroke가 차지하는 위치와 크기 파악

2. **객체-stroke 매칭 (정확도 우선)**:
   - 이미지를 보고 명확하게 식별 가능한 객체들만 매칭
   - 애매한 stroke는 '기타' 카테고리로 분류
   - 확실하지 않은 경우 보수적으로 판단

3. **${type}별 핵심 매칭 가이드**:
${type === 'house' ? `
   **집 그림 매칭:**
   - 지붕: 상단의 삼각형 또는 사다리꼴 형태
   - 벽: 지붕 아래 사각형 구조
   - 문: 하단 중앙의 직사각형
   - 창문: 벽면의 작은 사각형들
   - 굴뚝: 지붕 위의 작은 직사각형
   - 기타: 위 카테고리에 속하지 않는 모든 요소` : type === 'tree' ? `
   **나무 그림 매칭:**
   - 기둥: 수직 방향의 굵은 선 또는 직사각형
   - 가지: 기둥에서 뻗어나가는 선들
   - 수관: 상단의 큰 원형 또는 불규칙한 덩어리
   - 기타: 위 카테고리에 속하지 않는 모든 요소` : `
   **사람 그림 매칭:**
   - 머리: 상단의 원형 또는 타원형 윤곽
   - 얼굴: 머리 내부의 점이나 선 (눈, 코, 입)
   - 몸통: 머리 아래 큰 사각형 또는 원형
   - 팔: 몸통에서 좌우로 뻗어나가는 선
   - 다리: 몸통 아래에서 뻗어나가는 선
   - 손: 팔 끝의 작은 형태
   - 발: 다리 끝의 작은 형태
   - 기타: 위 카테고리에 속하지 않는 모든 요소`}

4. **객체별 stroke 그룹핑**:
   - 동일한 객체로 확실히 판단된 stroke들만 그룹으로 묶기
   - 각 그룹에서 가장 작은 strokeStartTime 찾기
   - 불확실한 경우 별도 객체로 분리하거나 '기타'로 분류

5. **시간 추출 및 변환**:
   - 각 객체 그룹의 최소 strokeStartTime을 MM:SS로 변환

**판단 기준 (정확도 우선순위):**
1. 명확한 형태와 위치 (확실한 것만 매칭)
2. 일반적인 그리기 패턴 고려
3. 애매한 경우 '기타'로 분류
4. 보수적 접근으로 정확도 확보

**중요: 응답에는 구체적인 좌표나 형태 분석 과정을 포함하지 마세요. 오직 획 매칭을 위한 내부 분석용으로만 사용하세요.**

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