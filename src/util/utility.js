export const capitalize = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

/**
* Function takes in a Date object and returns the day of the week in a text format.
*/
export const getWeekDay = (date) => {
  // Create an array containing each day, starting with Sunday.
  let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Use the getDay() method to get the day.
  let day = date.getDay();
  // Return the element that corresponds to that index.
  return weekdays[day];
};

export default capitalize;
