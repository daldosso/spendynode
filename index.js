var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    mongodb = require("mongodb"),
    ObjectID = mongodb.ObjectID,
    USERS_COLLECTION = "users",
    EXPENSES_COLLECTION = "expenses",
    db;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get("/spendykt", function(req, res) {
    res.status(200).json({
        success: true
    });
});

function createNewUser(req, res) {
    var newUser = req.body,
        sessionID = new ObjectID().toString();
    if (!newUser) {
        newUser = {};
    }
    newUser.createDate = new Date();
    newUser.sessionID = sessionID;
    db.collection(USERS_COLLECTION).insertOne(newUser, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            var sessionID = doc.ops[0].sessionID;
            res.status(201).json({
                sessionID: sessionID
            });
        }
    });
}

function retrieveUser(req, res) {
    var body = req.body,
        responseBody = {};
    responseBody.success = false;
    db.collection(USERS_COLLECTION).findOne({ sessionID: body.sessionID }, function(err, doc) {
        if (!err && doc) {
            responseBody.success = true;
        }
        res.status(200).json(responseBody);
    });
}

app.post("/spendykt-login", function(req, res) {
    var body = req.body;
    if (body.sessionID) {
        retrieveUser(req, res);
    } else {
        createNewUser(req, res);
    }
});

app.get("/spendykt-expenses", function(req, res) {
    var body = req.body,
        responseBody = {};
    responseBody.success = false;
    db.collection(EXPENSES_COLLECTION)
        .find({}, {})
        .toArray(
            function(err, expenses) {
                res.send({ expenses:  expenses});
            }
        );
});

mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    db = database;

    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });

});
