import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import User from '../models/user';

'use strict';

// transport service using which it can send emails in this case gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

const mailer = (req, res) => {
  res.send('/client/emailSender.html');
};

const submit = (req, res) => {
  // configuration object where we will configure all email details
  const mailOptions = {
    from: process.env.MAILER_EMAIL, // sender address
    to: req.body.email.toString(), // list of receivers
    subject: 'Please SignUp to SOAL Portal', // Subject line
    html: '<p>Hi click on this </p><a>link</a><p> to SignUp to School of Accelerated Learning Portal', // plain text body
  };

  User.find({ email: req.body.email.toString() }, (err, existingUser) => {
    if (!err && (existingUser.length != 0)) {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) { console.log(err); } else { console.log(info); }
      });

      res.redirect('/');
    }
  });
};

module.exports = { mailer, submit };
