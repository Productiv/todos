var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Todo = require('../models/todo');

handleError = function(res, callback) {
  return function(err, arg) {
    if(err) res.send({ success: false, message: err });
    else callback(arg);
  };
};

todoById = function(req, res, next) {
  var id = req.todoId || req.params.id;
  Todo.findOne({ _id: id }, handleError(res, function(todo) {
    req.todo = todo;
    next();
  }));
};

todosByOwner = function(req, res, next) {
  var id = req.ownerId || req.userId || req.params.uid;
  Todo.find({ owner: id }, handleError(res, function(todos) {
    req.todos = todos;
    next();
  }));
};

sendUserTodos = function(req, res) {
  Todo.find({ owner: req.uid }, handleError(res, function(todos) {
    res.send(todos);
  }));
};

createTodo = function(req, res, next) {
  Todo.create(req.todo, handleError(res, function(newTodo) {
    console.log('created newTodo: ', newTodo);
    req.todo = newTodo;
    next();
  }));
};

renderTodo = function(req, res) {
  res.render('todo', { todo: req.todo }, handleError(res, function(html) {
    res.send({ success: true, data: html });
  }));
};

sendTodo = function(req, res) {
  res.send({ success: true, data: req.todo });
}

renderOrSendTodo = function(req, res) {
  if(req.render) renderTodo(req, res);
  else sendTodo(req, res);
};

parseJson = function(str, options) {
  if(typeof str !== "string") return str;
  try {
    return JSON.parse(str);
  } catch(err) {
    if(options && options.verbose) console.log(err);
    return str;
  }
};

router.post('/todo', function(req, res, next) {
  var body = req.body;
  var todo = parseJson(body.data, { verbose: true });
  var render = !!body.render;

  todo.isDone = false;
  todo.index = Infinity;
  todo.createdAt = new Date();
  console.log('todo: ', todo);

  req.todo = todo;
  req.render = render;
  console.log('render: ', req.render);

  next();
}, createTodo, renderOrSendTodo);

router.get('/todo/:id', todoById, renderOrSendTodo);

router.put('/todo/:id', function(req, res, next) {
  var todoId = req.params.id;
  var todo = parseJson(req.body.data, { verbose: true });
  console.log('todoId: ', todoId);
  console.log('todo: ', todo);
  Todo.findOneAndUpdate({ _id: todoId }, todo, handleError(res, function(newTodo) {
    req.todo = newTodo;
    next();
  }));
}, renderOrSendTodo);

router.delete('/todo/:id', function(req, res) {
  var todoId = req.params.id;
  console.log('todoId: ', todoId);
  Todo.remove({ _id: todoId }, handleError(res, function() {
    res.send({ success: true });
  }));
});

router.get('/todos/:uid', todosByOwner, function(req, res) {
  res.send({ success: true, data: res.todos })
});

router.get('/todo/all', function(req, res) {
  Todo.find({}, handleError(res, function(todos) {
    res.send(todos);
  }));
});

router.post('/todo/reorder', function(req, res, next) {
  var ids = parseJson(req.body.data, { verbose: true });
  console.log('ids: ', ids);
  ids.map(function(id, i) {
    Todo.findOneAndUpdate({ _id: id }, { index: i+1 }, function(err) {
      if(err) res.send({ success: false, error: err });
    });
  });
  res.send({ message: "reordering todos" });
});

module.exports = router;
