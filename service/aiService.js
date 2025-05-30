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

        let allowedObjects = [];
        let objectDescription = '';
        switch (type) {
            case 'house':
                allowedObjects = ['지붕', '벽', '문', '창문', '기타'];
                objectDescription = '집';
                break;
            case 'tree':
                allowedObjects = ['줄기', '가지', '수관', '기타'];
                objectDescription = '나무';
                break;
            case 'man':
                allowedObjects = ['머리', '눈코입', '몸통', '팔', '다리', '손', '발', '기타'];
                objectDescription = '남자';
                break;
            case 'woman':
                allowedObjects = ['머리', '눈코입', '몸통', '팔', '다리', '손', '발', '기타'];
                objectDescription = '여자';
                break;
        }

        const prompt = `사용자는 현재 HTP 검사 중 ${objectDescription}을(를) 그렸습니다.
각 객체가 언제 시작되었는지 정확한 시간을 찾는 것이 목표입니다.

**매우 중요한 규칙들:**
1. 각 stroke는 단 하나의 객체에만 속합니다 - 중복 사용 절대 금지
2. 🔴 **객체 연속성 규칙**: 각 객체는 반드시 연속된 획들로만 구성됩니다
   - 사용자는 한 객체를 완전히 그린 후 다음 객체로 넘어갑니다
   - 같은 객체의 획들은 strokeIndex가 연속적이어야 합니다 (예: 1,2,3,4)
   - 중간에 다른 획이 끼어있으면 절대 같은 객체가 아닙니다 (예: 1,2,5,6 ❌)
   - 예시: strokeIndex 1,2,3→지붕, 4,5,6,7→벽 (연속적 ✅)
   - 잘못된 예시: strokeIndex 1,3,5→지붕 (2,4가 끼어있음 ❌)
3. 밀리초 변환 공식: strokeStartTime ÷ 1000 = 초, 그 다음 MM:SS 형식
   - 예: 2917ms ÷ 1000 = 2.917초 = 00:02 (소수점 버림)
   - 예: 7500ms ÷ 1000 = 7.5초 = 00:07
   - 예: 12340ms ÷ 1000 = 12.34초 = 00:12

**객체 분류 제한 규칙:**
🔴 **오직 다음 객체들만 분석하고 찾아내세요:**
${allowedObjects.map(obj => `- ${obj}`).join('\n')}

⚠️ **중요한 제한사항:**
- 위 목록에 없는 객체는 절대 분석하지 마세요
- 주제(${objectDescription})와 관련 없는 획들은 무시하세요
- 장식적이거나 배경적인 요소들은 '기타'로 분류하거나 무시하세요
- 확실하지 않은 객체는 분석하지 말고 넘어가세요

**정확한 분석 방법:**
1. **각 stroke의 형태와 위치 분석**:
   - 각 stroke의 points 배열을 보고 어떤 형태인지 파악 (직선, 곡선, 사각형, 삼각형 등)
   - stroke의 시작점과 끝점, 전체적인 방향성 확인
   - 전체 그림에서 해당 stroke가 차지하는 위치와 크기 파악

2. **허용된 객체와의 매칭**:
   - 이미지의 각 영역이 허용된 객체 목록 중 어떤 것에 해당하는지 확인
   - 각 stroke의 형태와 위치를 허용된 객체와 비교하여 매칭
   - 허용된 객체가 아니면 분석하지 않음

3. **객체별 stroke 그룹핑**:
   - 동일한 허용된 객체로 판단된 stroke들을 그룹으로 묶기
   - 각 그룹에서 가장 작은 strokeStartTime 찾기

4. **시간 추출 및 변환**:
   - 각 객체 그룹의 최소 strokeStartTime을 MM:SS로 변환

**판단 기준 (${objectDescription} 전용):**`;

        // 타입별 구체적인 판단 기준 추가
        switch (type) {
            case 'house':
                prompt += `
- 지붕: 상단의 삼각형 또는 사다리꼴 형태의 stroke들
- 벽: 지붕 아래의 사각형 형태를 만드는 수직/수평 직선들
- 문: 하단 중앙 부근의 작은 사각형 또는 반원 형태
- 창문: 벽 영역 내의 작은 사각형 형태들
- 기타: 위 4가지에 해당하지 않는 집 관련 요소들`;
                break;
            case 'tree':
                prompt += `
- 줄기: 중앙 하단의 수직 직선 또는 두꺼운 선
- 가지: 줄기에서 뻗어나가는 선들
- 수관: 상단의 둥근 형태나 잎사귀 덩어리
- 기타: 위 3가지에 해당하지 않는 나무 관련 요소들`;
                break;
            case 'man':
            case 'woman':
                prompt += `
- 머리: 상단의 원형 또는 타원형
- 눈코입: 머리 안의 얼굴 특징들 (눈, 코, 입을 하나의 객체로 분류)
- 몸통: 머리 아래의 사각형 또는 타원형 몸체
- 팔: 몸통 양쪽에서 뻗어나가는 선들
- 다리: 몸통 하단에서 뻗어나가는 선들
- 손: 팔 끝의 작은 형태들
- 발: 다리 끝의 작은 형태들
- 기타: 위 7가지에 해당하지 않는 사람 관련 요소들`;
                break;
        }

        prompt += `

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