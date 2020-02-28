import Sequelize from 'sequelize';
import request from 'superagent';
import db from '../database';


const CODE_ENDPOINT = 'https://codesandbox.io/api/v1/';

export const CodeSandbox = db.define('code_sandboxes', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  sandbox_id: Sequelize.STRING,
  host_id: Sequelize.STRING, // codesandbox user id.
  sandbox_setting: Sequelize.JSON,
});

// template [object] payload to send to codesandbox.
// embed_options[object] sends query parameters as object.
export const createTemplate = (template, embed_options) => {
  request
    .post(`${CODE_ENDPOINT}sandboxes/define?json=1`)
    .query(embed_options)
    .send(template)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .then(response => {
      console.log(response.text);
      return {
        text: 'Sanbox successfully created. redirect to ex: https://codesanbox.io/embed/<id>',
        data: response.text,
      };
    })
    .catch(err => {
      console.error(err);
      return {
        text: 'Failed to create a sandbox',
        err,
      };
    });
};
