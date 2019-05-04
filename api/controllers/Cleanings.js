var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

var CleaningSchema = new Schema({
    stay: {type: String, required: true},
    start: {type: String, required: true},
    end: {type: String, required: true},
    property: {type: Number, required: true},
    cleaner: {type: Number, required: true},
    cleaned: { type: Boolean, default: false}
});

module.exports = mongoose.model('Cleaning', CleaningSchema);