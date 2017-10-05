let config = require('config'),
    express = require('express'),
    app = express(),
    db = require("./database"),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    compression = require('compression');

app.use(bodyParser.json({limit: '20mb'}))
   .use(compression()).use(cors());

app.get("/spendykt", function(req, res) {
    res.status(200).json({
        success: true
    });
});

app.post("/spendykt-login", function(req, res) {
    let body = req.body;
    if (body.sessionID) {
        db.retrieveUser(req, res);
    } else {
        db.createNewUser(req, res);
    }
});

app.route("/spendykt-expenses")
    .get(db.readExpenses)
    .post(db.insertExpenses);

module.exports = {
    listen() {
        app.listen(config.HttpPort, function () {
            console.log('Http express listening on port ' + config.HttpPort);
        });
        return app;
    }
};
