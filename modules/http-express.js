let config = require('config'),
    express = require('express'),
    app = express(),
    db = require("./database"),
    bodyParser = require("body-parser"),
    cors = require('cors'),
    compression = require('compression');


app.use(express.static(__dirname + "/../public"));

console.log('__dirname', __dirname);

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

app.route("/run-users")
   .get(db.readRunUsers)
   .post(db.upsertRunUser)
   .delete(db.deleteRunUser);

app.route("/run-user-sin-up")
   .post(db.runUserSingUp);

app.route("/run-user-login")
   .post(db.runUserLogin)
   .delete(db.runUserLogout);

app.route("/run-events")
   .get(db.readRunEvents)
   .post(db.upsertRunEvent)
   .delete(db.deleteRunEvent);

app.route("/run-races")
   .get(db.readRunRaces)
   .post(db.upsertRunRaces)
   .delete(db.deleteRunRaces);

app.route("/pos-configuration")
    .get((req, res) => res.send({
        "menu": [
            { "id": 1, "desc": "Ricevimento merci", "template": "GetStuff" },
            { "id": 2, "desc": "Stampa etichette", "template": "PrintLabels" },
            { "id": 3, "desc": "Dettaglio prodotti", "template": "ProductsDetail" },
            { "id": 4, "desc": "Inventario", "template": "Inventary" }
        ],
        "templates": [
            { "id": 1, "template": "GetStuff", "fields": [{"id": 1, "desc": "Codice articolo"}, {"id": 2, "desc": "Quantità"}] },
            { "id": 2, "template": "PrintLabels", "fields": [{"id": 1, "desc": "Codice articolo"}, {"id": 2, "desc": "Quantità"}] },
            { "id": 3, "template": "ProductDetails", "fields": [{"id": 1, "desc": "Codice articolo"}, {"id": 2, "desc": "Quantità"}] },
            { "id": 4, "template": "Inventary", "fields": [{"id": 1, "desc": "Codice articolo"}, {"id": 2, "desc": "Quantità"}] }
        ]}
));

module.exports = {
    listen() {
        const port = app.get('port');
        app.listen(port, function () {
            console.log('Http express listening on port ' + port);
        });
        return app;
    }
};
