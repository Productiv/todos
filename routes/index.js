var express = require('express');
var router = express.Router();
var request = require('request');
var Todo = require('../models/todo');
var validateTokenUrl = 'http://accounts.productiv.me/api/token/validate';

function auth(req, res, next) {
  var uid = req.cookies['productivUid'];
  var token = req.cookies['productivToken'];
  console.log('uid: ', uid);
  console.log('token: ', token);
  if(!(uid && token)) res.redirect('/login');

  request.post(validateTokenUrl, {
    uid: uid,
    token: token
  }, function (err, res, body) {
    if(err || res.statusCode !== 200) res.send(err);
    else if(res.success) next();
    else {
      console.log(res.message);
      res.redirect('/login');
    }
  });
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
