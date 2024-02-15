import * as admin from "firebase-admin";
const serviceAccount = require("../glov-api-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.api = require("./api");
