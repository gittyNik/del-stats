import { Parser } from 'json2csv';

const flatten = (obj, path = '') => {
  if (!(obj instanceof Object)) return { [path.replace(/\.$/g, '')]: obj };

  return Object.keys(obj).reduce((output, key) => (obj instanceof Array
    ? { ...output, ...flatten(obj[key], `${path}[${key}].`) }
    : { ...output, ...flatten(obj[key], `${path + key}.`) }), {});
};

export const downloadResource = ({
  res, fileName, fields, data, flat,
}) => {
  let json2csv;
  if (flat) {
    data = data.map(eachRow => flatten(eachRow));
  }
  if (fields) {
    json2csv = new Parser({ fields });
  } else {
    json2csv = new Parser();
  }
  const csv = json2csv.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  return res.send(csv);
};

export default downloadResource;
