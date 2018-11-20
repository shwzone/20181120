var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallery = new Schema({
   title:  {type: String},
   author: {type: String},
   content: {type: String},
   created_at: {type: String},
   modified_at:  {type: String},
   imagelink : {type: String}
});

module.exports = mongoose.model('gallery', gallery);
