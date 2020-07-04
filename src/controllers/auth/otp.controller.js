import SendOtp from 'sendotp';
import {
  getOrCreateUser, getUserFromPhone,
  createUser, User,
  getUserByEmail,
} from '../../models/user';
import { getSoalToken } from '../../util/token';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';
import { createDeal } from '../../integrations/hubspot/controllers/deals.controller';

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
    }
  });
};

export const retryOTP = (req, res) => {
  const { phone, retryVoice } = req.body;

  // retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS
  sendOtp.retry(phone, retryVoice, (error, data) => {
    // console.log(data);
    if (error) console.error(error);
    res.send(data);
  });
};

// todo: clean up
const signInUser = (phone, res) => {
  getUserFromPhone(phone).then(user => {
    res.send({
      user,
      soalToken: getSoalToken(user),
    });
  }).catch((e) => {
    console.error(e);
    res.sendStatus(404);
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
      res.sendStatus(500).send('User email exists');
    }
    createUser({ name, phone, email }).then(user => res.send({
      user,
      soalToken: getSoalToken(user),
    }));
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const verifyOTP = (req, res) => {
  const { user, otp, action } = req.query;
  const { phone, email, fullName } = user;

  sendOtp.verify(phone, otp, (error, data) => {
    // console.log(data);
    if (error === null && data.type === 'success') { // OTP verified
      if (action === 'register') {
        register({
          email, phone, fullName, otpVerified: 'Yes',
        }, res);
      } else if (action === 'signin') {
        signInUser(phone, res);
      }
    } else { // if (data.type == 'error') // OTP verification failed
      res.sendStatus(401);
    }
  });
};
