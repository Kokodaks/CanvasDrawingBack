const mongoose = require('mongoose');

const eventStrokeSchema = new mongoose.Schema(
    {
        drawing : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DrawingStrokes"
        },
        eventStrokes:[
            {
                strokeOrder: {
                    type:[Number],
                    required: true,
                },
                event:{
                    type:[String],
                    required: true,
                }
            }
        ],
    }, 
    {collection : "event_strokes"}
);

const EventStrokes = mongoose.model("EventStrokes", eventStrokeSchema);

module.exports = EventStrokes;