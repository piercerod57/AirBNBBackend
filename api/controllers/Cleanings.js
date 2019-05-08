var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

var CleaningSchema = new Schema({
    start: {type: String, required: true},
    end: {type: String, required: true},
    property: {type: ObjectId, required: true},
    cleaner: {type: ObjectId, required: true},
    cleaned: { type: Boolean, default: false}
});

module.exports = mongoose.model('Cleaning', CleaningSchema);