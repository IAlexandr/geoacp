var morgan = require('morgan');
var serveStatic = require('serve-static');
var path = require('path');

var iisBaseUrl = require('iis-baseurl');

module.exports = function (app) {
    app.set('view engine', 'jade');

    app.use(morgan('dev'));

    app.use(iisBaseUrl());

    app.use(serveStatic(path.join(process.cwd(), 'static')));
};