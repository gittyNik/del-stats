import _ from 'lodash';
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
    return data;
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
  }
}

export const replaceFields = (key, value, htmlFile) => htmlFile.replace(`((${key}))`, value);

export const sendEmail = async (from_name, to_users, subject,
  html_path, auth, email_attachments, replacement_fields) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: auth.client_email,
      serviceClient: process.env.G_CLIENT,
      privateKey: process.env.PG_KEY.replace(/\\n/g, '\n'),
    },
  });

  let html_file = await downloadFile(AWS_BUCKET_NAME, html_path);
  let html = html_file.Body.toString('utf-8');
  Object.keys(replacement_fields).forEach((key) => {
    html = replaceFields(key, replacement_fields[key], html);
  });


  // send mail with defined transport object
  const mailOptions = {
    from: `"${from_name}" <${auth.client_email}>`, // sender address,
    to: to_users,
    subject,
    html,
  };

  // Downloading attachment files and sending as attachment
  if (!(_.isEmpty(email_attachments))) {
    let attachment_array = [];
    await Promise.all(email_attachments.map(async (attachment) => {
      const attachment_file = await downloadFile(AWS_BUCKET_NAME, attachment.aws_path);
      const attach_file = attachment_file.Body;
      attachment_array.push(
        {
          filename: attachment.filename,
          content: attach_file,
          contentType: attachment_file.ContentType,
        },
      );
    }));
    let key = 'attachments';
    mailOptions[key] = attachment_array;
  }


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return 'Error occurred';
    }
    // console.log('Email sent: %s', info.response);
    // console.log('Message sent: %s', info.messageId);
    return info.messageId;
  });
};

export const sendCohortEmail = async (from_name, cohort_ids, subject, html, auth, attachments) => {
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
  let messageId = await sendEmail(from_name, user_email_string, subject, html, auth, attachments);
  return messageId;
};

// Controller to send email for given email list
export const sendEmailApi = async (req, res) => {
  const {
    auth, user_emails, subject, html, from_name, attachments,
    replacement_fields,
  } = req.body;
  let messageId = await sendEmail(from_name, user_emails,
    subject, html, auth, attachments,
    replacement_fields);
  return res.json({
    text: 'Email sent successfully!',
    message_token: messageId,
  });
};

// Controller to send email to Cohorts
export const sendCohortEmailApi = async (req, res) => {
  const {
    auth, cohort_ids, subject, html, from_name, attachments,
  } = req.body;
  let messageId = await sendCohortEmail(from_name, cohort_ids, subject, html, auth, attachments);
  return res.json({
    text: 'Email sent successfully!',
    message_token: messageId,
  });
};
