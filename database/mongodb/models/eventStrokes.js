const mongoose = require('mongoose');

const eventStrokeSchema = new mongoose.Schema(
    {
        testId : {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['house', 'tree', 'man', 'woman'],
            required: true,
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