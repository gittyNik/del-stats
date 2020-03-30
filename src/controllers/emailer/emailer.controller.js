import nodemailer from 'nodemailer';

export const sendEmail = async (from_name, to_users, subject, html, auth) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: auth.email_client,
    auth: {
      user: auth.client_email,
      pass: auth.client_password,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"${from_name}" <${auth.client_email}>`, // sender address
    to: to_users, // list of receivers
    subject, // Subject line
    html, // html body
  });

  console.log('Message sent: %s', info.messageId);
  return info.messageId;
};

export const sendEmailApi = (req, res) => {
  const {
    auth, user_emails, subject, html, from_name,
  } = req.body;
  let messageId = sendEmail(from_name, user_emails, subject, html, auth);
  return res.json({
    text: 'Email sent successfully!',
    message_token: messageId,
  });
};
