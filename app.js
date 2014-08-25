var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var finder = require('./lib/finder');

var app = express();


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.get('/:collection/count', function (req, res) {
    var expression;

    if (req.query.expression) {
        try {
            expression = JSON.parse(req.query.expression);
        } catch (err) {
            return res.send(500, err.message);
        }
    } else {
        expression = {};
    }

    finder.count(req.params.collection, expression, function (err, result) {
        if (err) {
            return res.json(500, err);
        }
        return res.json(result);
    });
});

app.get('/:collection/find', function (req, res) {
    var expression;
    var skip;
    var limit;
    var sort;

    if (req.query.expression) {
        try {
            expression = JSON.parse(req.query.expression);
        } catch (err) {
            return res.send(500, err.message);
        }
    } else {
        expression = {};
    }

    try {
        skip = req.query.skip ? parseInt(req.query.skip) : 0;
        limit = req.query.limit ? parseInt(req.query.limit) : 10;
        sort = req.query.sort ? JSON.parse(req.query.sort) : {};
    } catch (err) {
        return res.send(500, err.message);
    }

    finder.find(req.params.collection, {expression: expression, skip: skip, limit: limit, sort: sort}, function (err, result) {
        if (err) {
            return res.json(500, err);
        }
        return res.json(200, result);
    });
});

app.get('/:collection/:objectId', function (req, res) {
    finder.findByObjectId(req.params.objectId, req.params.collection, function (err, result) {
        if (err) {
            return res.json(500, err);
        }
        return res.json(200, result);
    });
});


/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
