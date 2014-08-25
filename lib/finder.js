var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var mongoAddress = 'mongodb://si-sdsql:27017/';
var dbName = 'acp';
var db;

MongoClient.connect(mongoAddress + dbName, function (err, mongodb) {
    if (err) throw err;
    db = mongodb;
    console.log('Подключение к бд: ОК');
});

module.exports.findByObjectId = function (objectId, collection, callback) {
    db.collection(collection).findOne({_id: new ObjectId(objectId)}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        return callback(null, doc);
    });
};

module.exports.find = function (collection, query, callback) {
    db.collection(collection)
        .find(query.expression)
        .skip(query.skip)
        .limit(query.limit)
        .sort(query.sort)
        .toArray(callback);
};

module.exports.count = function (collection, expression, callback) {

    db.collection(collection)
        .find(expression)
        .count(callback);

};