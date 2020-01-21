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
export const TEMPLATE_FIREWALL_OFFERED = (cohort, paymentLink) => `Congratulations! We think you’ll be a great fit for our Product Engineering program and are happy to offer you admission for ${
  cohort.name} at our ${cohort.location} campus, starting on ${
  cohort.start_date.toString().replace(/\S+\s(\S+)\s(\d+)\s(\d+)\s.*/, '$2-$1-$3')
}
To confirm your admission, please pay the first tranche within the next 3 days: 
${paymentLink}`;
export const TEMPLATE_FIREWALL_REJECTED = `You show great potential to be a Product Engineer but we think you need to work some more on your skills before you can join our Product Engineering program.
Not all is lost though. You can attempt the Firewall again in 7 days. Please do go through the resources we have provided before you take another attempt at cracking the Firewall.`;
export const TEMPLATE_FIREWALL_RETRY = name => `Hey ${String.prototype.substring(name, 0, 20)}! You’re all set to take another crack at Firewall for our Product Engineering Program. Approach it with a fresh and calm mind. All the best :)`;

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
