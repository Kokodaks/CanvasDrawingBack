const fs = require('fs');
const path = require('path');
const {OpenAI} = require('openai');
const gptAnalysisService = require('../service/gptAnalysisService');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


exports.convertFinalToFile = async(finalImageBuffer, finalDrawingBuffer) =>{
    try{
        const dir = path.join(__dirname, '..','ai_uploads');
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        };
        const finalImgPath = path.join(dir, 'finalImg.png');
        const finalDrawingPath = path.join(dir, 'finalDrawing.json');
        const parsedJson = JSON.parse(finalDrawingBuffer.toString('utf-8'));
        
        fs.writeFileSync(finalImgPath, finalImageBuffer);
        fs.writeFileSync(finalDrawingPath, JSON.stringify(parsedJson, null, 2));
        console.log("Successfully converted and saved to /ai_uploads");
    }catch(error){
        console.log({message : "aiService convertFinalToFile", error : error.message});
    }
}

exports.sendFinalToOpenAi = async(finalImageBuffer, finalDrawingBuffer, type, testId) =>{
    try{

        let finalImage;
        let finalDrawingJson;
    
        if(process.env.NODE_ENV === 'production'){
            finalImage = finalImageBuffer.toString('base64');
            finalDrawingJson = JSON.parse(finalDrawingBuffer.toString());
        }else{
            this.convertFinalToFile(finalImageBuffer, finalDrawingBuffer);
            const finalImgPath = path.join(__dirname, '../ai_uploads/finalImg.png');
            const finalDrawingPath = path.join(__dirname, '../ai_uploads/finalDrawing.json');
            finalImage = fs.readFileSync(finalImgPath).toString('base64');
            finalDrawingJson = JSON.parse(fs.readFileSync(finalDrawingPath, 'utf-8'));
        }
    
        let objectElements = '';
        let objectDescription = '';
        
        switch(type) {
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
    
            제공된 이미지와 좌표 데이터를 분석하여 다음 정보를 추출해주세요:
    
            1. **객체 분석** (그림에 대한 객관적인 분석만 수행하며, 심리적 해석이나 의미 분석은 절대 포함하지 마세요):
            - 주요 객체 식별 및 시간 순서대로 나열 (정확한 타임스탬프 포함)
            - 각 객체의 객관적 특성: 
                * 크기(작음/중간/큼)
                * 위치(중앙/상단/하단/좌측/우측)
                * 선의 특성(굵기, 압력, 끊김 여부)
                * 상세 특징(형태, 비율, 구조적 특성)
    
            - 주요 관찰 대상: ${objectElements}
    
            2. **타임스탬프 생성 규칙**:
            - 모든 타임스탬프는 정확히 MM:SS 형식으로 작성 (예: "01:23")
            - 각 객체가 그려진 정확한 시작 시간을 기록
            - 여러 획(stroke)으로 구성된 객체의 경우, 첫 번째 획의 시작 시간 사용
            - 획의 시작 시간은 strokeStartTime 값을 기준으로 변환
    
            중요: 심리적 해석이나 감정 상태에 대한 추론, 의미 분석 등은 절대 포함하지 마세요. 오직 그림에서 관찰 가능한 객관적인 특성(크기, 위치, 선의 특징 등)만 분석하세요.
    
            응답은 다음 JSON 형식으로 작성해주세요. 단, JSON 마크다운 블록 없이, 순수 JSON만 응답해주세요.:
            {
            "objectiveSummary": "전체 그림에 대한 간략한 요약 (객관적 특성 중심)",
            "objectsTimestamps": [
                {
                "timestamp": "MM:SS",
                "event": "객체와 그 특성에 대한 상세 설명 (크기, 위치, 선의 특성, 상세 특징 등)",
                "type": "object"
                }
            ]
        }`;
    
        //좌표 json
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages:[
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                        {
                            type: "image_url",
                            image_url:{
                                url:`data:image/png;base64,${finalImage}`,
                            }
                        },
                        {
                            type: "text",
                            text: `좌표 데이터는 다음과 같은 구조로 제공됩니다:
                  
                                각 획(stroke)은 다음 속성들을 포함합니다:
                                - isErasing: 지우개 사용 여부 (true/false)
                                - strokeOrder: 획의 순서 번호
                                - strokeStartTime: 획 시작 시간(밀리초 타임스탬프)
                                - color: 16진수 형식의 색상 코드
                                - points: 획을 구성하는 좌표점 배열, 각 점은 다음 구조를 가짐:
                                    - x: 가로 좌표
                                    - y: 세로 좌표
                
                                좌표 데이터는 다음과 같습니다:\n\n${JSON.stringify(finalDrawingJson, null, 2)}`,
                        }
                    ]
                }
            ],
            max_tokens:1000,
        });
    
        const responseContent = response.choices[0].message.content;
        
        //응답 --> json 객체로 처리가 될 수 있게 markdown 제거
        const cleanedJsonString = extractJsonFromMarkdown(responseContent);

        //응답 --> JSON 객체로 parse
        const parsedResponse = parseJSONResponse(cleanedJsonString);
        
        //객체 정보만 추출하여 데이터 구성
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
    
        // 디버깅용 응답 출력
        console.log(`저장할 이벤트 데이터 수: ${events.length}`);
        if (events.length > 0) {
          console.log("첫 번째 이벤트:", JSON.stringify(events[0], null, 2));
        }
    
        // 저장
        return saveToGptAnalysis(events, type, testId, parsedResponse);
    }catch(err){
        console.error("aiService sendFinalToOpenAi 최종 그림 처리 오류 :", err.message);
        throw new Error(`최종 그림 처리 실패 : ${err.message}`);
    }
}

//gpt 응답에서 마크다운이 있다면, 마크다운 없이 리턴
function extractJsonFromMarkdown(responseContent){
    const match = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
    if(match) return match[1];
    return responseContent;
}

function parseJSONResponse(cleanedJsonString) {
    let parsedResponse;
    try{
        parsedResponse = JSON.parse(cleanedJsonString);
    }catch(err){
        console.error("JSON 파싱 오류:", err.message);
        parsedResponse = {error : "JSON 파싱 실패", raw : cleanedJsonString};
    }
    return parsedResponse;
}

const saveToGptAnalysis = async(events, type, testId, parsedResponse) =>{
    let savedData = null;
    if(events.length > 0){
        try{
            const numericTestId = parseInt(testId);
            savedData = await gptAnalysisService.saveGptAnalysis(numericTestId, type, events);
            console.log("aiService saveToGptAnalysis 저장 성공 : ", savedData);
            return {
                success : true,
                message : "그림 분석 및 저장 완료",
                data : savedData,
                originalResponse : parsedResponse
            };
        }catch(err){
            console.error("데이터베이스 저장 오류:", err.message);
            throw new Error(`데이터베이스 저장 실패 : ${err.message}`);
        }
    }else{
        console.warn("저장할 이벤트 데이터가 없습니다");
    }
}

