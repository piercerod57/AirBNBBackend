var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

var CleaningSchema = new Schema({
    start: {type: String, required: true},
    end: {type: String, required: true},
    property: {type: ObjectId, required: true}, // TODO This may need some tweaking to work
    cleaner: {type: ObjectId, required: true}, // TODO This may need some tweaking to work
    cleaned: { type: Boolean, default: false}
});

module.exports = mongoose.model('Cleaning', CleaningSchema);