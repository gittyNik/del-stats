import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import { getLearnerDetailsForCohorts } from '../../models/cohort';

const {
  AWS_BUCKET_NAME, AWS_ACCESS_KEY,
  AWS_SECRET, AWS_REGION, AWS_BASE_PATH,
} = process.env;

AWS.config.update(
  {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
    region: AWS_REGION,
  },
);
const s3 = new AWS.S3();

async function downloadFile(bucket, objectKey) {
  try {
    const params = {
      Bucket: bucket,
      Key: objectKey,
    };

    const data = await s3.getObject(params).promise();

    return data.Body.toString('utf-8');
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
  }
}

export const sendEmail = async (from_name, to_users, subject, html_path, auth) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: auth.email_client,
    auth: {
      user: auth.client_email,
      // TODO: Need to encode-decode password in transit
      pass: auth.client_password,
    },
  });

  let html = await downloadFile(AWS_BUCKET_NAME, html_path);

  // send mail with defined transport object
  const mailOptions = {
    from: `"${from_name}" <${auth.client_email}>`, // sender address,
    to: to_users,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return 'Error occurred';
    }
    console.log('Email sent: %s', info.response);
    console.log('Message sent: %s', info.messageId);
    return info.messageId;
  });
};

export const sendCohortEmail = async (from_name, cohort_ids, subject, html, auth) => {
  let user_emails = [];
  let cohort_array = cohort_ids.split(',');

  // Fetch Learners for the Cohorts
  let learnerDetails = await getLearnerDetailsForCohorts(cohort_array);
  // Get Individual User emails
  learnerDetails.forEach(eachCohortLearners => {
    let cohortLearners = eachCohortLearners.learnerDetails;
    cohortLearners.forEach(individualLearner => {
      user_emails.push(individualLearner.email);
    });
  });
  let user_email_string = user_emails.join(',');
  let messageId = await sendEmail(from_name, user_email_string, subject, html, auth);
  return messageId;
};

// Controller to send email for given email list
export const sendEmailApi = async (req, res) => {
  const {
    auth, user_emails, subject, html, from_name,
  } = req.body;
  let messageId = await sendEmail(from_name, user_emails, subject, html, auth);
  return res.json({
    text: 'Email sent successfully!',
    message_token: messageId,
  });
};

// Controller to send email to Cohorts
export const sendCohortEmailApi = async (req, res) => {
  const {
    auth, cohort_ids, subject, html, from_name,
  } = req.body;
  let messageId = await sendCohortEmail(from_name, cohort_ids, subject, html, auth);
  return res.json({
    text: 'Email sent successfully!',
    message_token: messageId,
  });
};
