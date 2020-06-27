const request = require('superagent');
const jwt = require('jsonwebtoken');

const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000),
};
const token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);

export const userInfo = (req, res) => {
  const { ZOOM_BASE_URL } = process.env;
  // const email = req.body.email
  request
    .get(`${ZOOM_BASE_URL}users`)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .query({
      status: 'active',
      page_size: '30',
      page_number: '1',
      // role_id: '',
    })
    .then(data => {
      // console.log(data);
      // console.log(data.body);
      res.json({
        text: 'List/Array of all users in the zoom account',
        data: data.body.users,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const temp = () => console.log('TODO');
