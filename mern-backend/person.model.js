const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;
let person = new Schema({
    id:{
        type: Number,
        require     :   true
    },
    name:{
        type: String,
        require     :   true
    },
    mobile:{
        type:Number,
        require     :   true
    },
    cityid:{
        type: Number,
        require     :   true
    },
    notes:{
        type: String,
    }
    
},{collection: 'person'});

module.exports = mongoose.model('person', person);