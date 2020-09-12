import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { apiInternal as apiV1 } from "./v1/main";

admin.initializeApp();

const db = admin.firestore();
const updatedb = admin.firestore;

const webAppV1 = functions.https.onRequest(apiV1);

export { db, webAppV1, updatedb };
