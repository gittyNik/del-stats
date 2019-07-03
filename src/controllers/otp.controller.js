import User from '../models/user';
import SendOtp from '../util/sendotp';
import {getSoalToken} from '../util/token';

const sendOtp = new SendOtp(process.env.SEND_OTP_API_KEY, "Use {{otp}} to login with DELTA. Please do not share it with anybody! {SOAL Team}");

export const sendOTP = (req, res) => {
  const {phone} = req.body;

  sendOtp.setOtpExpiry(5);
  sendOtp.send(phone, 'SOALIO', (error, data) => {
    console.log(data);
    res.send(data);
  });
}

export const retryOTP = (req, res) => {
  const {phone, retryVoice} = req.body;

  //retryVoice Boolean value to enable Voice Call or disable Voice Call and use SMS 
  sendOtp.retry(phone, retryVoice, (error, data) => {
    res.send(data);
  });
}

// todo: clean up
export const verifyOTP = (req, res) => {
  const {phone, otp, apply} = req.body;

  sendOtp.verify(phone, otp, function (error, data) {
    if (data.type == 'success') { // OTP verified
      User.findOne({where: {phone}}).then(async user => {
        if(user == null) {
          try{
            user = await User.create({phone, role});
          } catch(e){
            res.sendStatus(404);
          }
        }
        res.json({
          user,
          soalToken: getSoalToken(),
        });

      }).catch(e => res.sendStatus(404));
    } else if (data.type == 'error') // OTP verification failed
      res.sendStatus(401);
    });
  }
