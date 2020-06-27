import "core-js/stable";
import "regenerator-runtime/runtime";
import "dotenv/config";
import app from "./server";
import db from "./database";
import request from "superagent";
import { userAndTeamCommitsDayWise } from "./integrations/github/controllers";
const { PORT } = process.env;

db.authenticate()
	.then(() => {
		app.listen(PORT, err => {
			if (!err) {
				console.log(`Server is running on port: ${PORT}`);
			}
		});
	})
	.catch(err =>
		console.error("Database failure: Try running db migrations", err)
	);
