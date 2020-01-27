import SendOtp from 'sendotp';
import { getOrCreateUser, getUserFromPhone, createUser } from '../../models/user';
import { getSoalToken } from '../../util/token';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';

const sendOtp = new SendOtp(process.env.MSG91_API_KEY, 'Use {{otp}} to login with DELTA. Please do not share it with anybody! {SOAL Team}');

export const sendOTP = (req, res) => {
  const { phone } = req.body;

  sendOtp.setOtpExpiry(5);
  sendOtp.send(phone, 'SOALIO', (error, data) => {
    console.log(data);
    if (error === null && data.type === 'success') {
      res.send(data);
    } else { res.sendStatus(400); }
  });
};

export const retryOTP = (req, res) => {
  const { phone, retryVoice } = req.body;

  // retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS
  sendOtp.retry(phone, retryVoice, (error, data) => {
    console.log(data);
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

const register = (user, res) => {
  const { fullName: name, phone, email } = user;
  getUserFromPhone(phone).then(data => {
    if(data) {
      return res.sendStatus(409);
    }
    // create hubspot contact
    createOrUpdateContact(user).then(result => {
      //create user if already not exists
      createUser({ name, phone, email }).then(user => {
        return res.send({
          user,
          soalToken: getSoalToken(user)
        })
      })

    }).catch(err => {
      console.log(err);
      res.sendStatus(500);
  });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  })

}

export const verifyOTP = (req, res) => {
  const { user, otp, action } = req.query;

  sendOtp.verify(user.phone, otp, (error, data) => {
    console.log(data);
    if (error === null && data.type === 'success') { // OTP verified
      if(action === "register") {
        register(user, res);
      } else if(action === "signin") {
        signInUser(user.phone, res);
      }
    } else { // if (data.type == 'error') // OTP verification failed
      res.sendStatus(401);
    }
  });
};
