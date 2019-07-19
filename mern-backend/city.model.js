const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;
let city = new Schema({
    id:{
        type: Number
    },
    name:{
        type: String
    },
    countryid:{
        type: Number
    }
},{collection: 'city'});

module.exports = mongoose.model('city', city);