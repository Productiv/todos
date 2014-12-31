var express = require('express');
var router = express.Router();
var request = require('request');
var Todo = require('../models/todo');
var validateTokenUrl = 'http://accounts.productiv.me/api/token/validate';
var getUserUrl = 'http://accounts.productiv.me/api/user/'

function getUser(req, res, next) {
  var uid = req.cookies['productivUid'];
  if(!uid) next();
  console.log('getUser uid: ', uid);
  request(getUserUrl + uid, function (err, _res, user) {
    console.log('user: ', user);
    if(err || _res.statusCode !== 200) {
      console.log('error retrieving user: ', err);
      console.log('status code: ', _res.statusCode);
      next();
    }
    else {
      req.user = JSON.parse(user);
      next();
    }
  });
};

function auth(req, res, next) {
  var uid = req.cookies['productivUid'];
  var token = req.cookies['productivToken'];
  console.log('uid: ', uid);
  console.log('token: ', token);
  if(!(uid && token)) res.redirect('/login');

  request.post({
    url: validateTokenUrl,
    body: {
      uid: uid,
      token: token
    },
    json: true
  }, function (err, _res, body) {
    console.log('body: ', body);
    if(err || _res.statusCode !== 200) res.send(err);
    else if(body.success) next();
    else {
      console.log('message: ', body.message);
      res.redirect('/login');
    }
  });
};

todosByOwner = function(req, res, next) {
  var uid = req.cookies.productivUid;
  console.log('uid: ', uid);
  Todo.find({ owner: uid }, function(err, todos) {
    console.log('found todos: ', todos);
    if(err) res.send(err);
    else {
      req.todos = todos;
      next();
    }
  });
};

sort = function(ary, comp) {
  var a = ary;
  a.sort(comp);
  return a;
};

sortTodosByMostRecent = function(req, res, next) {
  req.todos = sort(req.todos, function(newer, older) {
    return older.createdAt - newer.createdAt;
  });
  next();
};

sortTodosByIndex = function(req, res, next) {
  req.todos = sort(req.todos, function(first, second) {
    return first.index - second.index;
  });
  next();
};

router.get('/', auth, getUser, todosByOwner, sortTodosByIndex,
  function(req, res) {
    res.render('todos', {
      todos: req.todos,
      user: req.user
    });
  });

router.get('/todo/:id', findOneTodo, function(req, res) {
  res.render('todo', { todo: req.todo });
});

router.get('/login', function(req, res) {
  res.render('login');
});

module.exports = router;