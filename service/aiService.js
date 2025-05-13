const fs = require('fs');
const path = require('path');
const {OpenAI} = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const saveDir = path.join(__dirname, '..','ai_uploads');

exports.convertFinalToFile = async(finalImageBuffer, finalDrawing) =>{
    try{
        const finalImgPath = path.join(saveDir, 'finalImg.png');
        const finalDrawingPath = path.join(saveDir, 'finalDrawing.json');
        
        fs.writeFileSync(finalImgPath, finalImageBuffer);
        fs.writeFileSync(finalDrawingPath, JSON.stringify(finalDrawing, null, 2));
        console.log("Successfully converted and saved to /ai_uploads");
    }catch(error){
        console.log({message : "aiService convertFinalToFile", error : error.message});
    }
}

exports.sendFinalToOpenAi = async(finalImageBuffer, finalDrawing) =>{
    let finalImage;
    let finalDrawingJson;

    if(process.env.NODE_ENV === 'production'){
        finalImage = finalImageBuffer;
        finalDrawingJson = finalDrawing;
    }else{
        this.convertFinalToFile(finalImageBuffer, finalDrawing)
        const finalImgPath = path.join(__dirname, '../ai_uploads/finalImg.png');
        const finalDrawingPath = path.join(__dirname, '../ai_uploads/finalDrawing.json');
        finalImage = fs.readFileSync(finalImgPath).toString('base64');
        finalDrawingJson = fs.readFileSync(finalDrawingPath, 'utf-8');
    }
    
    const prompt = `사용자는 현재 HTP 검사 중 그림을 그리다가 일부를 지웠습니다.두 이미지를 비교하여 어떤 부분이 지워졌는지 분석하고, 
    지우기 행동의 심리적 의미를 간략히 설명해주세요. 응답은 다음 JSON 형식이어야 합니다:
    {
      "event": "지워진 요소에 대한 설명",
      "type": "erase",
      "interpretation": "지우기 행동의 심리적 해석"
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
                        text: `좌표 데이터는 다음과 같습니다 : \n\n${finalDrawingJson}`,
                    }
                ]
            }
        ],
        max_tokens:1000,
    });

    console.log("🧠 GPT 응답:", response.choices[0].message.content);
    
    return response;
    
}




