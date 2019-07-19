const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;
let country = new Schema({
    _id:{
        type: ObjectId
    },
    id:{
        type: Number
    },
    name:{
        type: String
    }
},{collection: 'country'});

module.exports = mongoose.model('country', country);