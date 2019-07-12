import {getOrCreateUser} from '../models/user';
import SendOtp from '../util/sendotp';
import {getSoalToken} from '../util/token';

const sendOtp = new SendOtp(process.env.MSG91_API_KEY, "Use {{otp}} to login with DELTA. Please do not share it with anybody! {SOAL Team}");

export const sendOTP = (req, res) => {
  const {phone} = req.body;

  sendOtp.setOtpExpiry(5);
  sendOtp.send(phone, 'SOALIO', (error, data) => {
    console.log(data);
    if (error == null && data.type == 'success') {
      res.send(data);
    } else
      res.sendStatus(400);
  });
}

export const retryOTP = (req, res) => {
  const {phone, retryVoice} = req.body;

  //retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS
  sendOtp.retry(phone, retryVoice, (error, data) => {
    console.log(data);
    res.send(data);
  });
}

// todo: clean up
const signInUserByPhone = (phone, res) => {
  getOrCreateUser(phone).then(user => {
    res.send({
      user,
      soalToken: getSoalToken(user),
    });
  }).catch(e => {
    console.error(e);
    res.sendStatus(404);
  });
}

export const verifyOTP = (req, res) => {
  const {phone, otp} = req.query;

  sendOtp.verify(phone, otp, function (error, data) {
    console.log(data);
    if (error == null && data.type == 'success') { // OTP verified
      signInUserByPhone(phone, res);
    } else  // if (data.type == 'error') // OTP verification failed
      res.sendStatus(401);
  });
}
