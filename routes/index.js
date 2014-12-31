
module.exports = function(app) {
  app.use('/api', require('./todos'));
  app.use('/', require('./views'));
};
