import { createPad } from "./pad.controller.js";

const createInterviewEndpoint = (req, res) => {
  const { name } = req.body;
  createPad(name)
    .then((data) => res.send({ data }))
    .catch((err) => res.status(500).send(err));
};

export { createInterviewEndpoint, createPad };
