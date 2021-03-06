import Sequelize from 'sequelize';
import request from 'superagent';
import { v4 as uuid } from 'uuid';
import db from '../database';
import logger from '../util/logger';

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
export const createSandbox = async (payload) => {
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
  payload = (Object.keys(payload).length > 0) ? payload : defaultTemplate;
  let sandbox_setting = {
    defaultTemplate,
    embed_options,
  };
  try {
    const response = await request
      .post(`${CODE_ENDPOINT}sandboxes/define?json=1`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload)
      .query(embed_options);
    // logger.info(response);
    // todo: store the sandbox id in DB.
    return CodeSandbox.create({
      id: uuid(),
      sandbox_id: response.body.sandbox_id,
      sandbox_setting,
    });
  } catch (err) {
    logger.error(err);
    return {
      text: 'Failed to create a sandbox',
      err,
    };
  }
};
