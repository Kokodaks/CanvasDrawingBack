const mongoose = require('mongoose');

const finalStrokesSchema = new mongoose.Schema(
    {
        testId : {
            type: Number,
            required: true,
        },
        type : {
            type: String,
            enum: ['house', 'tree', 'man', 'woman'],
            required: true,
        },
        strokes:[
            {
                strokeOrder:{
                    type: Number,
                    required: true,
                },
                strokeStartTime : {
                    type : Number,
                    required: true,
                },
                color : {
                    type : String,
                    required: true,
                },
                isErasing:{
                    type: Boolean,
                    required: true,
                },
                points: [
                    {
                        _id: false,
                        x : {
                            type: Number,
                            required: true
                        },
                        y : {
                            type: Number,
                            required: true
                        },
                        t : {
                            type: Number,
                            required: true
                        },
                        p : {
                            type: Number,
                            required: true,
                        }
                    }
                ],
            }
        ],
    }, 
    {collection : "final_strokes"}
);

const FinalStrokes = mongoose.model("FinalStrokes", finalStrokesSchema);

module.exports = FinalStrokes;