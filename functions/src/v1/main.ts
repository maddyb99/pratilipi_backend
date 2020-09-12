import * as express from "express";
import * as utils from "./utils";
import { userModule } from "./user";
import { postModule } from "./posts";

const apiInternal = express();
const version = "/api/v1";

const userApi = utils.registerModule("/user", userModule);
const postApi = utils.registerModule("/post", postModule);

apiInternal.use(version, userApi);
apiInternal.use(version, postApi);

export { apiInternal };
