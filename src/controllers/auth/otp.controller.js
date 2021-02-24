import SendOtp from 'sendotp';
import {
  getOrCreateUser, getUserFromPhone,
  createUser,
  getUserByEmail, USER_ROLES,
} from '../../models/user';
import { getSoalToken } from '../../util/token';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';
import { sendMessageToSlackChannel } from '../../integrations/slack/team-app/controllers/milestone.controller';

const sendOtp = new SendOtp(process.env.MSG91_API_KEY, 'Use {{otp}} to login with DELTA. Please do not share it with anybody! {SOAL Team}');

export const requestOTP = (phone, res) => {
  sendOtp.setOtpExpiry(5);
  sendOtp.send(phone, 'SOALIO', (error, data) => {
    console.log(data);
    if (error === null && data.type === 'success') {
      res.send(data);
    } else { res.sendStatus(400); }
  });
};

export const sendOTP = (req, res) => {
  const { user, action } = req.body;
  const {
    phone, email, firstName, lastName, utm_source, utm_medium, utm_campaign,
  } = user;
  getUserFromPhone(phone).then(data => {
    if (action === 'register') {
      if (data) {
        return res.sendStatus(409);
      }
      if (data === null) {
        // create hubspot contact
        createOrUpdateContact({
          phone,
          email,
          firstName,
          lastName,
          otpVerified: 'No',
          utm_source,
          utm_medium,
          utm_campaign,
        }).then(() => {
          requestOTP(phone, res);
        }).catch(err => {
          console.error(err);
          res.sendStatus(500);
        });
      }
    } else if (action === 'signin') {
      if (data === null) {
        return res.sendStatus(404);
      }
      requestOTP(phone, res);
    } else if (action === 'recruiter_register') {
      if (data === null) {
        return requestOTP(phone, res);
      }
      if (data) {
        return res.sendStatus(409);
      }
    }
  });
};

export const retryOTP = (req, res) => {
  const { phone, retryVoice } = req.body;

  // retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS
  sendOtp.retry(phone, retryVoice, (error, data) => {
    // console.log(data);
    if (error) console.error(error);
    return res.send(data);
  });
};

// todo: clean up
const signInUser = (phone, res) => {
  getUserFromPhone(phone).then(user => res.send({
    user,
    soalToken: getSoalToken(user),
  })).catch((e) => {
    console.error(e);
    return res.sendStatus(404);
  });
};

const register = (data, res) => {
  let {
    fullName: name, phone, email, otpVerified,
  } = data;
  // create hubspot contact
  createOrUpdateContact({ email, otpVerified }).then(async () => {
    email = email.toLowerCase();
    let isExistingUser = await getUserByEmail(email);
    if (isExistingUser !== null) {
      res.status(409).send('User email exists');
    }
    createUser({ name, phone, email }).then(user => res.send({
      user,
      soalToken: getSoalToken(user),
    }));
  }).catch(err => {
    console.error(err);
    return res.sendStatus(500);
  });
};

const recruiterRegister = (data, res) => {
  let {
    fullName: name, phone, email, position,
  } = data;
  createUser(
    {
      name, phone, email, profile: { company: { position } },
    },
    USER_ROLES.RECRUITER,
  )
    .then((user) => res.send({
      user,
      soalToken: getSoalToken(user),
    }))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const verifyOTP = (req, res) => {
  const { user, otp, action } = req.body;
  const { phone, email, fullName } = user;

  sendOtp.verify(phone, otp, (error, data) => {
    if ((error === null && data.type === 'success')
      || (data.type === 'error' && data.message === 'already_verified')
      || (data.type === 'error' && data.message.includes('already verified'))) {
      // OTP verified
      if (action === 'register') {
        register({
          email, phone, fullName, otpVerified: 'Yes',
        }, res);
      } else if (action === 'recruiter_register') {
        recruiterRegister({
          email, phone, fullName,
        }, res);
      } else if (action === 'signin') {
        signInUser(phone, res);
      }
    } else {
      // if (data.type == 'error') // OTP verification failed
      console.log(`User ${fullName} failed OTP for phone: ${phone}`);
      console.warn(`Data received from MSG91 api: ${data.message}`);
      console.warn(`Data type from MSG91 api: ${data.type}`);
      console.warn(`Error received from MSG91 api: ${error}`);
      try {
        let message = `Phone Number: ${phone}. Reason:  ${data.message}`;
        let context = 'Failed OTP verification';
        sendMessageToSlackChannel(message, context, process.env.SLACK_MSG91_CHANNEL);
      } catch (err2) {
        console.warn('Unable to send message to slack');
      }
      return res.sendStatus(401);
    }
  });
};

export const registerRecruiterAPI = async (req, res) => {
  const {
    phone, email, name, position,
  } = req.body;
  return recruiterRegister({
    phone, email, fullName: name, position,
  }, res);
};
