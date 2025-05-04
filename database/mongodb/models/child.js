const mongoose = require('mongoose');

const childSchema = new mongoose.Schema(
    {
        childid:{
            type : Number,
            required: true,
        },
        familyBackground:{
            type: Number,
            required: true,
        },
        personalHistory:{
            type: Number,
            required: true,
        }
        
    }, 
    {collection : "child"}
);

const child = mongoose.model("child", childSchema);

module.exports = child;