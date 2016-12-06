var express = require('express'),
    app = express(),
    mongodb = require("mongodb"),
    ObjectID = mongodb.ObjectID,
    USERS_COLLECTION = "users",
    db;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

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

app.post("/spendykt-login", function(req, res) {
    var newContact = req.body;
    newContact.createDate = new Date();
    db.collection(USERS_COLLECTION).insertOne(newContact, function(err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new contact.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });
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
