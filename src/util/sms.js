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
export const TEMPLATE_TEST_FINISHED = 'Phew! Now that you’re done with your Firewall attempt, sit back and relax while we review it. Keep an eye out for your personalised report soon';
export const TEMPLATE_FIREWALL_REVIEWED = name => `Hello ${String.prototype.substring(name, 0, 20)}! Our educators have reviewed your Firewall attempt. Your personalised report along with your admission decision is available now on https://firewall.soal.io/firewall`;
export const TEMPLATE_FIREWALL_RETRY = name => `Hey ${String.prototype.substring(name, 0, 20)}! You’re all set to take another crack at Firewall for our Product Engineering Program. Approach it with a fresh and calm mind. All the best :)`;
export const TEMPLATE_PAYMENT_SUCCESS = cohort => `We’ve received the payment of the first tranche and are glad to confirm your admission for ${
  cohort.name} starting on ${cohort.start_date.toString().replace(/\S+\s(\S+)\s(\d+)\s(\d+)\s.*/, '$2-$1-$3')} in ${cohort.location}`;

export const sendSms = (phone, message) => new Promise((resolve, reject) => {
  msg91.send(phone, message, (err, data) => {
    if (err === null && data) {
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
