const mongoose = require('mongoose');

const reconstructionSchema = new mongoose.Schema(
    {
        testid:{
            type : Number,
            required: true,
        },
        childid:{
            type: Number,
            required: true,
        },
        strokeOrder:{
            type: Number,
            required: true,
        },
        timestamp : {
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
        isErase:{
            type: Boolean,
            required: true,
        },
        points: [
            {
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
    }, 
    {collection : "reconstruction"}
);

const reconstruction = mongoose.model("reconstruction", reconstructionSchema);

module.exports = reconstruction;