import crypto from 'crypto';
import _ from 'lodash';
import moment from 'moment';
import cache from '../../../../cache';

async function randomString(size = 9) {
  return crypto
    .randomBytes(size)
    .toString('hex')
    .slice(0, size);
}

// adding dsc prefix
export const createState = async (value) => {
  const key = await randomString();
  await cache.set(`dsc${key}`, JSON.stringify(value), 'ex', 1 * 60 * 10); // 10 minutes
  return key;
};

export const retrieveState = async ({ key }) => {
  const string = await cache.get(`dsc${key}`);
  const data = JSON.parse(string);
  return data;
};

export const removeState = ({ key }) => cache.del(`dsc${key}`);

export const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

let verifier = base64URLEncode(crypto.randomBytes(32));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export const challenge = base64URLEncode(sha256(verifier));

export const mirrorKeyArray = (arr) => _.zipObject(_.map(arr, (ele) => ele.toUpperCase().replaceAll('.', '_')), arr);

export const getCohortFormattedId = ({ data, program_type }) => data.filter(
  e => e.program_id === program_type,
).map(
  e => String(`${e.name}-${e.type}-${e.duration === 26 ? 'ft' : ''}${e.duration === 16 ? 'pt' : ''}-${moment(e.start_date).format('MMM')}-${moment(e.start_date).format('YY')}`).toLowerCase(),
);
