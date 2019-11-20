import SendOtp from 'sendotp';
import Msg91 from 'msg91';

const { MSG91_API_KEY } = process.env;
const MSG91_OTP = 'Use {{otp}} to login with DELTA. Please do not share it with anybody! {team: \'SOAL\'}';
const MSG91_TRANSACTIONAL = 4;
const SENDER_ID = 'SOALIO';

/*
*  Transactional SMS Section
*/
const msg91 = new Msg91(MSG91_API_KEY, SENDER_ID, MSG91_TRANSACTIONAL);
export const TEMPLATE_TEST_FINISHED = 'Congratulations on your successful application for SOAL\'s. Your application is going through the review process. You will be notified about the status.';

export const sendSms = (phone, message) => new Promise((resolve, reject) => {
  msg91.send(phone, message, (err, data) => {
    if (err === null && data.type === 'success') {
      resolve(data);
    } else {
      reject(err);
    }
  });
});

/*
*  OTP Section
*/
const msg91Otp = new SendOtp(MSG91_API_KEY, MSG91_OTP);
msg91Otp.setOtpExpiry(5); // minutes

const filterSuccess = response => ((response.type === 'success') ? response : Promise.reject(response.type));

export const sendOtp = phone => msg91Otp.send(phone, SENDER_ID).then(filterSuccess);
export const retrySendOtp = phone => msg91Otp.retry(phone).then(filterSuccess);
export const verifyOtp = (phone, otp) => msg91Otp.verify(phone, otp).then(filterSuccess);
