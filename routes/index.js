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

  request.post({
    url: validateTokenUrl,
    body: {
      uid: uid,
      token: token
    },
    json: true
  }, function (err, _res, body) {
    console.log('err: ', err);
    console.log('_res: ', _res);
    console.log('body: ', body);
    if(err || _res.statusCode !== 200) res.send(err);
    else if(body.success) next();
    else {
      console.log('message: ', body.message);
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
