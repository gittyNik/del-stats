import uuid from 'uuid/v4';

/**
 * Generates a random number between parameter
 *
 * @param  {num} Num uppperlimit to generate a number
 *
 * @return {num} random number from 0 to n
 */
export const randomNum = (num) => Math.floor(Math.random() * (num || 10 - 1)) + 1;

/**
 * Generates a uuids between parameter
 *
 * @param  {num} Num uppperlimit to generate a number, defualts to randomNum(5)
 *
 * @return {num} random number from 0 to n
 */

export const generateUuids = (n) => {
  const arrayUUID = Array.from({ length: (n || randomNum(5)) }, () => uuid());
  return arrayUUID;
};

/**
 * Returns a array of length n with each element
 * described by the function passed
 *
 * @param  {num} Num Array index, default to be random of 5
 * @param  {fn} function to feed individual elements
 *
 * @return {num} random number from 0 to n
 */

export const generateArray = (fn, n) => Array.from({ length: (n || randomNum(5)) }, () => fn());
