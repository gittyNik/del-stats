import request from 'superagent';
import { baseUrl, key } from '../codeInterview.auth';

const createPad = (name = 'Interview') => request
  .post(`${baseUrl}/1/pads/new?key=${key}`)
  .send({ name })
  .then((data) => JSON.parse(data.text))
  .catch((err) => {
    console.warn(`Unable to create Interview: ${name}`);
    return err;
  });

const getAllPads = () => request
  .get(`${baseUrl}/1/pads?key=${key}`)
  .then((data) => JSON.parse(data.text))
  .catch((err) => {
    console.warn('Unable to fetch Interviews');
    return err;
  });

const getPadById = id => request
  .get(`${baseUrl}/1/pads/${id}?key=${key}`)
  .then((data) => JSON.parse(data.text))
  .catch((err) => {
    console.warn(`Unable to fetch Interview with id: ${id}`);
    return err;
  });

const endInterview = id => request
  .post(`${baseUrl}/1/pads/${id}/end?key=${key}`)
  .send({ id })
  .then((data) => JSON.parse(data.text))
  .catch((err) => {
    console.warn('Unable to end Interview');
    return err;
  });

export { createPad, getPadById, endInterview };
