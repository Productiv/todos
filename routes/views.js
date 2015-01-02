var express = require('express');
var router = express.Router();
var request = require('request');
var Todo = require('../models/todo');
var accountsUrl = 'http://accounts.productiv.me/api';

getUser = function(req, res, next) {
  var uid = req.cookies['productivUid'];
  if(!uid) next();
  var url = accountsUrl + '/user/' + uid;
  request(url, function (err, _res, user) {
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

validateToken = function(uid, token, next) {
  request.post({
    url: accountsUrl + '/token/validate',
    body: {
      uid: uid,
      token: token
    },
    json: true
  }, next);
};

auth = function(req, res, next) {
  var uid = req.cookies['productivUid'];
  var token = req.cookies['productivToken'];

  if(!uid || !token)) res.redirect('/login');
  else {
    validateToken(uid, token, function (err, _res, body) {
      if(err || _res.statusCode !== 200) res.send(err);
      else if(body.success) next();
      else {
        console.log('message: ', body.message);
        res.redirect('/login');
      }
    });
  }
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

router.get('/todo/:id', todoById, renderTodo);

router.get('/login', function(req, res) {
  res.render('login');
});

module.exports = router;