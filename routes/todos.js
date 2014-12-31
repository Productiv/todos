var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Todo = require('../models/todo');

router.get('/todo/all', function(req, res) {
  Todo.find({}, function(err, todo) {
    if(err) res.send(err);
    else    res.send(todo);
  });
});

findOneTodo = function(req, res, next) {
  var id = req.todoId || req.params.id
  Todo.findOne({ _id: id }, function(err, todo) {
    if(err) res.send(err);
    else {
      req.todo = todo;
      next();
    }
  });
};

router.get('/todo/:id', function(req, res, next) {
  req.todoId = req.params.id;
  console.log('todoId: ', req.todoId);
  next();
}, findOneTodo, function(req, res, next) { res.send(req.todo) });

sendUserTodos = function(req, res) {
  Todo.find({ owner: req.uid }, function(err, todos) {
    if(err) res.send(err);
    else    res.send(todos);
  });
};

router.get('/todos/:userId', function(req, res) {
  var uid = req.params.userId;
  console.log('uid: ', uid);
  req.uid = uid;
  sendUserTodos(req, res);
});

router.post('/todo', function(req, res, next) {
  var body = req.body;
  console.log('body: ', body);
  var data = JSON.parse(body.data);
  console.log('data: ', data);
  var todo = data.todo;
  todo.isDone = false;
  todo.createdAt = new Date();
  console.log('todo: ', todo);
  Todo.create(todo, function(err, todo) {
    if(err) res.send({ success: false, error: err });
    else {
      if(data.render) {
        console.log('created todo: ', todo);
        req.todo = todo;
        next();
      }
      else res.send({ success: true, todo: todo });
    }
  });
}, function(req, res) { res.render('todo', { todo: req.todo })});

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
