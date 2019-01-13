let config = require('config'),
    express = require('express'),
    app = express(),
    db = require("./database"),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    compression = require('compression');

app.set('port', (process.env.PORT || 5000));

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

app.route("/spendykt-monthly-expenses")
   .get(db.readMonthlyExpenses);

app.route("/spendykt-expenses")
   .get(db.readExpenses)
   .post(db.insertExpenses)
   .delete(db.deleteExpense);

app.route("/spendykt-categories")
   .get(db.readCategories)
   .post(db.insertCategories)
   .delete(db.deleteCategory);

app.route("/log")
   .get(db.readLogs)
   .post(db.upsertLog)
   .delete(db.deleteLog);

app.route("/challenge-run")
   .get(db.readChallengeRun)
   .post(db.upsertChallengeRun)
   .delete(db.deleteChallengeRun);

module.exports = {
    listen() {
        const port = app.get('port');
        app.listen(port, function () {
            console.log('Http express listening on port ' + port);
        });
        return app;
    }
};
