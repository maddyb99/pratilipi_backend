import * as express from "express";
import * as utils from "./utils";
import { userModule } from "./user";

const apiInternal = express();
const version = "/api/v1";

const userApi = utils.registerModule("/user", userModule);

apiInternal.use(version, userApi);

export { apiInternal };
