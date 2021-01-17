let expressHttpApp = require('./modules/http-express'),
    db = require("./modules/database");

//db.connect();
let app = expressHttpApp.listen();
module.exports = app; // for testing