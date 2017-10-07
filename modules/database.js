let config = require('config'),
    mongodb = require("mongodb"),
    ObjectID = require('mongodb').ObjectID,
    db;

const LOG_COLLECTION = 'log',
      USERS_COLLECTION = "users",
      EXPENSES_COLLECTION = "expenses";

let isArray = (a) => (!!a) && (a.constructor === Array);

let success = (res) => {
    if (res) {
        res.status(201).json({
            success: true
        });
    }
};

let handleError = (res, reason) => {
    console.log("Error: " + reason);
    res.status(500).json({"error": reason});
};

let handleResponse = (res) => {
    return (err) => {
        if (err) {
            handleError(res, err.message);
        } else {
            success(res);
        }
    }
};

let createObjectID = (id) => new ObjectID(id);

module.exports = {
    connect() {
        mongodb.MongoClient.connect(process.env.MONGODB_URI, (err, database) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            db = database;
            console.log("Database connection ready");
        });
    },

    createNewUser(req, res) {
        let newUser = req.body,
            sessionID = new ObjectID().toString();
        if (!newUser) {
            newUser = {};
        }
        newUser.createDate = new Date();
        newUser.sessionID = sessionID;
        db.collection(USERS_COLLECTION).insertOne(newUser, (err, doc) => {
            if (err) {
                handleError(res, err.message, "Failed to create new contact.");
            } else {
                let sessionID = doc.ops[0].sessionID;
                res.status(201).json({
                    sessionID: sessionID
                });
            }
        });
    },

    retrieveUser(req, res) {
        let body = req.body,
            responseBody = {};
        responseBody.success = false;
        db.collection(USERS_COLLECTION).findOne({ sessionID: body.sessionID }, (err, doc) => {
            if (!err && doc) {
                responseBody.success = true;
            }
            res.status(200).json(responseBody);
        });
    },

    readExpenses(req, res) {
        let body = req.body,
            responseBody = {};
        responseBody.success = false;
        db.collection(EXPENSES_COLLECTION)
            .find({}, {})
            .toArray((err, expenses) => res.send(expenses));
    },

    insertExpenses(req, res) {
        let expense = req.body;
        if (isArray(expense)) {
            db.collection(EXPENSES_COLLECTION).insertMany(expense, handleResponse(res));
        } else {
            db.collection(EXPENSES_COLLECTION).insertOne(expense, handleResponse(res));
        }
    },

    deleteExpense(req, res) {
        db.collection(EXPENSES_COLLECTION).removeOne(
            { id: req.params.id },
            handleResponse(res)
        );
    },

    readLogs(req, res) {
        let body = req.body,
            responseBody = {};
        responseBody.success = false;
        db.collection(LOG_COLLECTION)
            .find({}, {})
            .toArray((err, expenses) => res.send(expenses));
    },

    upsertLog(req, res) {
        let log = req.body;
        db.collection(LOG_COLLECTION).insertOne(log, handleResponse(res));
    },

    deleteLog(req, res) {
        console.log("req.query.id", req.query.id);
        db.collection(LOG_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

};
