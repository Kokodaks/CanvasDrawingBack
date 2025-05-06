const reconService = require('../service/reconService');

exports.createStrokeData = async(req, res) =>{
    try{
        const {drawing} = req.body;
        console.log('받은 데이터: ', drawing);
        const strokeData = await reconService.createStrokeData(drawing);

        console.log('저장된 데이터: ', strokeData);
        
        return res.status(200).json({message: '✅ successfully sent stroke and created stroke data'});
    }catch(error){
        console.log("저장 실패!! : ", error.message);
        return res.status(500).json({message:'❌ error createing stroke data', error: error.message});
    }
}

// exports.getJsonData = async(req, res) =>{
//     try{
        
//     }catch(error){

//     }
// }

// exports.getSvgData = async(req, res) => {
//     try{
        
//     }catch(error){

//     }
// }

