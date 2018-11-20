var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var board2 = new Schema({
   title:  {type: String},
   content: {type: String},
   created_at: { type: String, default: new Date().toISOString().slice(5,10)},
   userfile: {type: String}
});

module.exports = mongoose.model('board2', board2);
