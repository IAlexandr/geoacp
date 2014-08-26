var finder = require('./lib/finder');

module.exports = function (app) {

    var resSetOptions = {
        'Content-Type': 'text/plain',
        'charset': "windows-1251"
    };

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
            res.set(resSetOptions);
            if (err) {
                return res.json(500, err);
            }
            return res.json(200, result);
        });
    });

    app.get('/:collection/:objectId', function (req, res) {
        finder.findByObjectId(req.params.objectId, req.params.collection, function (err, result) {
            res.set(resSetOptions);
            if (err) {
                return res.json(500, err);
            }
            return res.json(200, result);
        });
    });

    app.get('/', function (req, res) {
        res.render('index');
    });
};