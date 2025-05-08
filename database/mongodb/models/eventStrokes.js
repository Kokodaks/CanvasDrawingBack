const mongoose = require('mongoose');

const eventStrokeSchema = new mongoose.Schema(
    {
        drawing : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DrawingStrokes"
        },
        eventStrokes:[
            {
                strokeOrder:{
                    type: Number,
                },
                event:[
                    {
                        type: String,
                    }
                ],
            }
        ],
    }, 
    {collection : "event_strokes"}
);

const EventStrokes = mongoose.model("EventStrokes", eventStrokeSchema);

module.exports = EventStrokes;