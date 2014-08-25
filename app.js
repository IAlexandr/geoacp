var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();

require('./appsetup')(app);
require('./routes')(app);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

var port = process.env.PORT || 4080;

console.log('try to listen on port ' + port + ' ...');
app.listen(port);

console.log('Server listening on port', port);




