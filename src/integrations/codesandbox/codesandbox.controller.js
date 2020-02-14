import request from 'superagent';

const CODE_ENDPOINT = 'https://codesandbox.io/api/v1/';

export const createSandbox = (req, res) => {
  const payload = {
    files: {
      'package.json': {
        content: {
          dependencies: {
            react: 'latest',
            'react-dom': 'latest',
          },
        },
      },
      'index.js': {
        content: '',
      },
      'index.html': {
        content: '',
      },
    },
  };

  request
    .post(`${CODE_ENDPOINT}sandboxes/define?json=1`)
    .send(payload)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .then(response => {
      console.log(response.text);
      res.json({
        text: 'Id of newly created codesandbox, used to redirect ex: https://codesanbox.io/s/<id>',
        data: response.text.sandbox_id,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const createTemplate = (req, res) => {
  // todo: creating template sanboxes.
};
