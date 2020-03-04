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
export const createSandbox = (payload) => {
  const defaultTemplate = {
    files: {
      'package.json': {
        content: {
          dependencies: {
          },
        },
      },
      'index.js': {
        content: ' ',
      },
    },
  };
  const embed_options = {
    code_mirror: 1,
    theme: 'dark',
    view: 'editor',
    runonclick: 1,
    eslint: 1,
  };
  payload = payload || defaultTemplate;
  return request
    .post(`${CODE_ENDPOINT}sandboxes/define?json=1`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(payload)
    .query(embed_options)
    .then(response => {
      console.log(response);
      return {
        text: 'Sanbox successfully created. redirect to ex: https://codesanbox.io/embed/<id>',
        data: response.body,
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
