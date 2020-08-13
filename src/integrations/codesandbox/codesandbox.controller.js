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
      // console.log(response.body);
      res.json({
        text: 'Id of newly created codesandbox, used to redirect ex: https://codesanbox.io/embed/<id>',
        data: response.body,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

// template [object] payload to send to codesandbox.
// embed_options[object] sends query parameters as object.
export const createTemplate = (template, embed_options) => {
  request
    .post(`${CODE_ENDPOINT}sandboxes/define?json=1`)
    .query(embed_options)
    .send(template)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .then(response =>
      // console.log(response.text);
      ({
        text: 'Id of newly created codesandbox, used to redirect ex: https://codesanbox.io/embed/<id>',
        data: response.text,
      }))
    .catch(err => {
      console.error(err);
      return err;
    });
};
