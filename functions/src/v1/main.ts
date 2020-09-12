import * as express from "express";
import * as utils from "./utils";
import * as functions from "firebase-functions";
import { userModule } from "./user";
import { postModule } from "./posts";

const apiInternal = express();
const version = "/api/v1";

const userApi = utils.registerModule("/user", userModule);
const postApi = utils.registerModule("/post", postModule);

const apiKey = functions.config().pratipali.client_key;
const authMiddleware = function (req: any, res: any, next: any) {
  if (req.headers.authorization !== apiKey) {
    return res.status(403).json({ error: "Unauthorized request!" });
  }
  next();
  return null;
};

apiInternal.use(authMiddleware);
apiInternal.use(version, userApi);
apiInternal.use(version, postApi);

export { apiInternal };
