var morgan = require('morgan');

var iisBaseUrl = require('iis-baseurl');

module.exports = function (app) {
    app.set('view engine', 'jade');

    app.use(morgan('dev'));

    app.use(iisBaseUrl());
};