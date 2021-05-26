import crypto from 'crypto';
import _ from 'lodash';
import moment from 'moment';
import cache from '../../../../cache';
import { PROGRAM_NAMES } from '../config';

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

function base64URLEncode(string) {
  return string.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

let verifier = base64URLEncode(crypto.randomBytes(32));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export const challenge = base64URLEncode(sha256(verifier));

export const mirrorKeyArray = (array) => _.zipObject(_.map(array, (ele) => ele.toUpperCase().replaceAll('.', '_')), array);

export const getCohortFormattedId = ({ data }) => data.map(
  cohort => String(`${cohort.name}-${cohort.duration === 16 ? 'ft' : (cohort.duration === 26 ? 'pt' : '')}${cohort.type}-${moment(cohort.start_date).format('MMM')}-${moment(cohort.start_date).format('YY')}-${PROGRAM_NAMES.find(program => program.id === cohort.program_id).sf}`).toLowerCase(),
);
