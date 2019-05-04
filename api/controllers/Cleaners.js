var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

var CleanersSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
});


module.exports = mongoose.model('Cleaners', CleanersSchema);