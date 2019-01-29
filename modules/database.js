let config = require('config'),
    mongodb = require("mongodb"),
    ObjectID = require('mongodb').ObjectID,
    db;

const LOG_COLLECTION = 'log',
      USERS_COLLECTION = "users",
      EXPENSES_COLLECTION = "expenses",
      CATEGORIES_COLLECTION = "categories",
      CHALLENGE_RUN_COLLECTION = "challengerun",
      RUN_USERS_COLLECTION = "runusers",
      RUN_USERS_LOGIN_COLLECTION = "runuserslogin",
      RUN_USERS_SESSION_COLLECTION = "runuserssession",
      RUN_EVENTS_COLLECTION = "runevents",
      RUN_RACES_COLLECTION = "runraces";

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

let parseDate = (expense) => {
    if (expense.date && expense.date.length === 10 && expense.date.indexOf('/') === 2) {
        let parsedExpense = expense;
        parsedExpense.year = expense.date.substring(6, 10);
        parsedExpense.month = expense.date.substring(3, 5);
        return parsedExpense;
    }
    return expense;
};

let readData = (req, res, collection) => {
    let body = req.body,
        responseBody = {};
    responseBody.success = false;
    db.collection(collection)
        .find({}, {})
        .toArray((err, data) => res.send(data));
};

let insertData = (data, res, collection) => {
    if (isArray(data)) {
        db.collection(collection).insertMany(data, handleResponse(res));
    } else {
        db.collection(collection).insertOne(data, handleResponse(res));
    }
};

let deleteData = (id, res, collection) => {
    db.collection(collection).removeOne({ id }, handleResponse(res));
};

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

    readMonthlyExpenses(req, res) {
        let responseBody = {};
        responseBody.success = false;
        db.collection(EXPENSES_COLLECTION)
            .aggregate([
                { $group: {"_id": {"year": "$year", "month": "$month"}, "amount": {$sum: "$amount"}}},
                { $project: {"year": "$_id.year", "month": "$_id.month", "amount": 1}}
            ])
            .toArray((err, expenses) => {
                return res.send(expenses);
            });
    },

    readExpenses(req, res) {
        readData(req, res, EXPENSES_COLLECTION);
    },

    readCategories(req, res) {
        readData(req, res, CATEGORIES_COLLECTION);
    },

    insertExpenses(req, res) {
        let data = parseDate(req.body);
        insertData(data, res, EXPENSES_COLLECTION);
    },

    insertCategories(req, res) {
        let data = req.body;
        insertData(data, res, CATEGORIES_COLLECTION);
    },

    deleteExpense(req, res) {
        deleteData(req.params.id, res, EXPENSES_COLLECTION);
    },

    deleteCategory(req, res) {
        deleteData(req.params.id, res, CATEGORIES_COLLECTION);
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
        log.serverDate = new Date();
        db.collection(LOG_COLLECTION).insertOne(log, handleResponse(res));
    },

    deleteLog(req, res) {
        console.log("req.query.id", req.query.id);
        db.collection(LOG_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

    readChallengeRun(req, res) {
        let body = req.body,
            responseBody = {};
        responseBody.success = false;
        db.collection(CHALLENGE_RUN_COLLECTION)
            .find({}, {})
            .toArray((err, data) => res.send(data));
    },

    upsertChallengeRun(req, res) {
        let data = req.body;
        data.serverDate = new Date();
        db.collection(CHALLENGE_RUN_COLLECTION).insertOne(data, handleResponse(res));
    },

    deleteChallengeRun(req, res) {
        db.collection(CHALLENGE_RUN_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

    readRunUsers(req, res) {
        let responseBody = {};
        responseBody.success = false;
        db.collection(RUN_USERS_COLLECTION)
            .find({}, {})
            .toArray((err, data) => res.send(data));
    },

    upsertRunUser(req, res) {
        let data = req.body;
        data.serverDate = new Date();
        db.collection(RUN_USERS_COLLECTION).insertOne(data, handleResponse(res));
    },

    deleteRunUser(req, res) {
        db.collection(RUN_USERS_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

    runUserSingUp(req, res) {
        let data = req.body;
        data.serverDate = new Date();
        db.collection(RUN_USERS_LOGIN_COLLECTION).insertOne(data, handleResponse(res));
    },

    runUserLogin(req, res) {
        let body = req.body,
            responseBody = {};
        responseBody.success = false;
        db.collection(RUN_USERS_LOGIN_COLLECTION)
            .find({ username: body.username, password: body.password }, {})
            .toArray((err, data) => {
                if (data.length === 1) {
                    let session = {
                        username: data[0].username,
                        start: new Date()
                    }
                    db.collection(RUN_USERS_SESSION_COLLECTION).insertOne(session, (err, doc) => {
                        console.log('doc', doc);
                        if (err) {
                            handleError(res, err.message, "Failed to create new user.");
                        } else {
                            let sessionID = doc.ops[0].sessionID;
                            res.status(201).json({
                                sessionID: sessionID
                            });
                        }
                    });
                }
            });
    },

    runUserLogout(req, res) {
        let responseBody = {};
        responseBody.success = false;
        db.collection(RUN_USERS_COLLECTION)
            .find({}, {})
            .toArray((err, data) => res.send(data));
    },

    readRunEvents(req, res) {
        let responseBody = {};
        responseBody.success = false;
        db.collection(RUN_EVENTS_COLLECTION)
            .find({}, {})
            .toArray((err, data) => res.send(data));
    },

    upsertRunEvent(req, res) {
        let data = req.body;
        data.serverDate = new Date();
        db.collection(RUN_EVENTS_COLLECTION).insertOne(data, handleResponse(res));
    },

    deleteRunEvent(req, res) {
        db.collection(RUN_EVENTS_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

    readRunRaces(req, res) {
        let responseBody = {};
        responseBody.success = false;
        db.collection(RUN_RACES_COLLECTION)
            .find({}, {})
            .toArray((err, data) => res.send(data));
    },

    upsertRunRaces(req, res) {
        let data = req.body;
        data.serverDate = new Date();
        db.collection(RUN_RACES_COLLECTION).insertOne(data, handleResponse(res));
    },

    deleteRunRaces(req, res) {
        db.collection(RUN_RACES_COLLECTION).removeOne(
            { _id: createObjectID(req.query.id) },
            handleResponse(res)
        );
    },

};
