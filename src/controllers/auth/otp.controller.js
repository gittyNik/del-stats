import SendOtp from 'sendotp';
import request from 'superagent';
import {
  getUserFromPhone,
  createUser,
  getUserByEmail, USER_ROLES,
} from '../../models/user';
import { getSoalToken } from '../../util/token';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';
import { sendMessageToSlackChannel } from '../../integrations/slack/team-app/controllers/milestone.controller';
import logger from '../../util/logger';

const sendOtp = new SendOtp(process.env.MSG91_API_KEY, '{{otp}} is the OTP to verify your mobile number with SOAL. Please do not share this with anyone. This OTP is valid for 10 minutes.');

//
// Check OTP Balance, type = 106
export const checkBalance = () => request
  .get(`https://control.msg91.com/api/balance.php?authkey=${process.env.MSG91_API_KEY}&type=106`)
  .then(data => parseInt(data.text, 10))
  .catch(err => {
    console.warn(`Error fetching message balance: ${err}`);
    return null;
  });

export const checkBalanceApi = async (req, res) => {
  try {
    const balance = await checkBalance();
    return res.json({
      message: 'Message Balance',
      balance,
    });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export const requestOTP = (phone, res) => {
  sendOtp.setOtpExpiry(5);
  sendOtp.send(phone, 'SOALIO', (error, data) => {
    logger.info(data);
    if (error === null && data.type === 'success') {
      return res.send(data);
    }
    return res.send({
      message: 'Unable to send OTP',
      type: 'failure',
    });
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
        return createOrUpdateContact({
          phone,
          email,
          firstName,
          lastName,
          otpVerified: 'No',
          utm_source,
          utm_medium,
          utm_campaign,
        }).then(() => requestOTP(phone, res)).catch(err => {
          console.error(err);
          return res.sendStatus(500);
        });
      }
    } else if (action === 'signin') {
      if (data === null) {
        return res.sendStatus(404);
      }
      return requestOTP(phone, res);
    } else if (action === 'recruiter_register') {
      if (data === null) {
        return requestOTP(phone, res);
      }
      if (data) {
        return res.sendStatus(409);
      }
    } else if (action === 'send_otp') {
      // Only when send OTP is required
      return requestOTP(phone, res);
    }
  });
};

export const retryOTP = (req, res) => {
  const { phone, retryVoice } = req.body;

  // retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS
  sendOtp.retry(phone, retryVoice, (error, data) => {
    // console.log(data);
    if (error) {
      console.error(error);
      return res.send({
        message: 'Resending OTP failed!',
        type: 'failure',
      });
    }
    return res.send({
      message: 'OTP resent successfully!',
      type: 'success',
      data,
    });
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
    logger.error(e);
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
      return res.status(409).send('User email exists');
    }
    return createUser({ name, phone, email }).then(user => res.send({
      user,
      soalToken: getSoalToken(user),
    }));
  }).catch(err => {
    logger.error(err);
    res.sendStatus(500);
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
      logger.error(err);
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
      } else if (action === 'send_otp') {
        // Only when send OTP is required
        return res.send({
          message: 'OTP verified successfully!',
          type: 'success',
        });
      }
    } else {
      // if (data.type == 'error') // OTP verification failed
      logger.info(`User ${fullName} failed OTP for phone: ${phone}`);
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
      return res.send({
        message: 'OTP verification failed',
        type: 'failure',
      });
      // return res.sendStatus(401);
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
