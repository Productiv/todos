var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Todo = require('../models/todo');

router.get('/todo/:id', function(req, res) {
  var todoId = req.params.id;
  console.log('todoId: ', todoId);
  Todo.findOne(todoId, function(err, todo) {
    if(err) res.send(error);
    else    res.send(todo);
  });
});

router.post('/todo', function(req, res) {
  var todo = req.body;
  console.log('todo: ', todo);
  todo.owner = new ObjectId;
  todo.done = false;
  Todo.create(todo, function(err) {
    if(err) res.send({ success: false, error: err });
    else    res.send({ success: true });
  });
});

router.put('/todo/:id', function(req, res) {
  var todoId = req.params.id;
  var todo = req.body;
  console.log('todoId: ', todoId);
  console.log('todo: ', todo);
  Todo.findOneAndUpdate({ _id: todoId }, todo, function(err) {
    if(err) res.send({ success: false, error: err });
    else    res.send({ success: true });
  });
});

router.delete('/todo/:id', function(req, res) {
  var todoId = req.params.id;
  console.log('todoId: ', todoId);
  Todo.remove({ _id: todoId }, function(err) {
    if(err) res.send({ success: false, error: err });
    else    res.send({ success: true });
  });
});

module.exports = router;
