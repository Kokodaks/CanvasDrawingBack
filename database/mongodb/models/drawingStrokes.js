const mongoose = require('mongoose');

const drawingStrokesSchema = new mongoose.Schema(
    {
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
                strokeWidth:{
                    type : Number,
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
                        }
                    }
                ],
            }
        ],
    }, 
    {collection : "drawing_strokes"}
);

const DrawingStrokes = mongoose.model("DrawingStrokes", drawingStrokesSchema);

module.exports = DrawingStrokes;