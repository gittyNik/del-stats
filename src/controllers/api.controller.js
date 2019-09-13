
export const send404 = (req, res) => res.sendStatus(404);

export const sendSampleResponse = (req, res) => res.send('Delta API');

export const apiNotReady = (req, res) => res.status(405).send('This url endpoint is recognized, but not implemented/ready yet. It will be available in future versions of the API');

export default sendSampleResponse;
