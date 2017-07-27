var notFoundHandler = require('./404-handler.js');
var errorHandler = require('./error-handler.js');
var router = require('./router');

var midware = module.exports;

midware.notFoundHandler = notFoundHandler;
midware.errorHandler = errorHandler;
midware.router = router;