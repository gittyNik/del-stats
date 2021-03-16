import uuid from 'uuid/v4';
import _ from 'lodash';

export const cleanEntry = (obj) => JSON.stringify(obj).replace(/"/g, '\\"');

/**
 * Cleans OBJ to generate sequelize compatible JSON
 *
 * @param  {obj} OBJECT object to Clean
 *
 * @return {string} String with cleaned object */
export const cleanJSON = (obj) => JSON.stringify(obj).replace(/`/g, '\\`');

/**
 * Cleans Array to generate sequelize compatible Array of JSON
 *
 * @param  {arr} Arr Array to Clean
 *
 * @return {string} String with cleaned array
 */
export const cleanArray = (arr) => `{"${arr.map(e => cleanEntry(e)).join('", "')}"}`;

/**
 * Creates compatible Array for sequelize
 *
 * @param  {arr} Arr Array to Clean
 *
 * @return {string} String with cleaned array
 */
export const compatibleArray = (arr) => `{${arr.join(',')}}`;

/**
 * Generates a random number between parameter
 *
 * @param  {num} Num uppperlimit to generate a number
 *
 * @return {num} random number from 1 to n
 */
export const randomNum = (num) => Math.floor(Math.random() * (num || 10 - 1)) + 1;

export const getSomeElements = (array) => _.sample(array, randomNum(array.length));

/**
 * Generates a uuids between parameter
 *
 * @param  {num} Num uppperlimit to generate a number, defualts to randomNum(5)
 *
 * @return {num} Array of uuids with random or num length
 */

export const generateUuids = (n) => {
  const arrayUUID = Array.from({ length: (n || randomNum(5)) }, () => uuid());
  // return arrayUUID;
  return compatibleArray(arrayUUID);
};

/**
 * Returns a array of length n with each element
 * described by the function passed
 *
 * @param  {num} Num Array index, default to be random of 5
 * @param  {fn} function to feed individual elements
 * @param  {ar} Array Array of arguments to be Passed in the above function (optional)
 *
 * @return {num} random number from 0 to n
 */

export function generateArray(n, fn, ar) {
  return ar
    ? Array.from({ length: (n || randomNum(5)) }, () => fn(...ar))
    : Array.from({ length: (n || randomNum(5)) }, () => fn());
}
