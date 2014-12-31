var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId     = mongoose.Schema.Types.ObjectId;

var TodoSchema = new Schema({
  owner: ObjectId,
  title: String,
  done: Boolean,
  createdAt: Date
});

module.exports = mongoose.model('Todo', TodoSchema);