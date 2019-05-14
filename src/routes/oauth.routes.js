import Express from 'express';
import request from 'superagent';
import jwt from 'jsonwebtoken';
import User from '../models/user'

const router = Express.Router();

const getProfileFromGithub = ({text: githubToken}) => new Promise((resolve, reject) => {

  request.get('https://api.github.com/user?'+githubToken).then(profileResponse => {
    const {email, login, id, name, company, location, bio, avatar_url} = profileResponse.body;
    const profile = {email, login, id, name, company, location, bio, avatar_url};
    User.findOne({email}).then(user => resolve({user, profile, githubToken}) )
    .catch(err=>{
      // User not found. Checking alternate emails!
      request.get('https://api.github.com/user/emails?'+githubToken).then(emailResponse => {
        let emails = emailResponse.body.map(o=>o.email);
        User.findOne({email: {$in: emails}}).then(user=>{
          user.emails = emails;
          resolve({user, profile, githubToken});
        } )
        .catch(reject);
      });
    });
  })
  .catch(reject);

});


// This is the first request made in the sign in process. A token will be sent back to the frontend for authentication with github
router.get('/github/signin', (req, res)=>{

console.log('sdfsdf');
  let params = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code
  };

  request.post('https://github.com/login/oauth/access_token').send(params)
  .then(getProfileFromGithub)
  .then(({user, profile, githubToken}) => {
    // User found. Sending a jsonwebtoken to the client!
    const soalToken = jwt.sign({ user: user._id, githubToken }, process.env.JWT_SECRET);
    if(user.profile && user.profile.github){
      return res.send({soalToken, user});
    }
    // new user signed up
    user.profile = { ...user.profile, github: profile };
    // Updating user with the github profile
    user.save().then(user=>{
      // Update succeeded
      res.send({soalToken, user});
    }).catch(err => {
      // Update Failed!!!
      res.send({soalToken, user})
    });
  }).catch(err => {
    console.log(err)
    res.status(404).send('User not found!!!');
  })

});

module.exports = router;
