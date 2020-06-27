import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";
import app from "./server";
import db from "./database";
import request from "superagent";
import { userAndTeamCommitsDayWise } from "./integrations/github/controllers";
import logger from './util/logger';
const { PORT } = process.env;

db
  .authenticate()
  .then(() => {
    app.listen(PORT, err => {
      if (!err) {
        logger.info(`Server is running on port: ${PORT}`);
      }
    });
  })
  .catch(err =>
    logger.error("Database failure: Try running db migrations", err)
  );
