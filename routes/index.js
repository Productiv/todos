var express = require('express');
var router = express.Router();
var Todo = require('../models/todo');

function auth(req, res, next) {
  var uid = req.cookies['productiv-uid'];
  var token = req.cookies['productiv-token'];
  if(!(uid || token)) res.redirect('/login');
};

router.get('/', auth, function(req, res) {
  var uid = req.cookies.uid;
  console.log('uid: ', uid);
  Todo.find({ owner: uid }, function(err, todos) {
    if(err) res.send(error);
    else    res.render('todos', { todos: todos });
  });
});

router.get('/login', function(req, res) {
  res.render('login');
});

module.exports = router;
