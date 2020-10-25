import request from "superagent";
import { baseUrl, key } from "../codeInterview.auth.js";

const createPad = (name = "Interview") =>
  request
    .post(`${baseUrl}/1/pads/new?key=${key}`)
    .send({ name })
    .then((data) => data)
    .catch((err) => {
      console.warn(`Unable to create Interview: ${name}`);
      return err;
    });

export { createPad };
