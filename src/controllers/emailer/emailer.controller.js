import _ from 'lodash';
import nodemailer from 'nodemailer';
import { getLearnerDetailsForCohorts } from '../../models/cohort';
import logger from '../../util/logger';
import { downloadFile, type_upload } from '../../util/file-fetcher';

const BUCKET_PATH = type_upload.emailer;
export const replaceFields = (key, value, htmlFile) => htmlFile.replace(`{{${key}}}`, value);

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

  let html_file = await downloadFile(BUCKET_PATH.bucketName, html_path);
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
      const attachment_file = await downloadFile(BUCKET_PATH.bucketName, attachment.aws_path);
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
      logger.error(error);
      return 'Error occurred';
    }
    logger.info('Email sent: %s', info.response);
    // logger.info('Message sent: %s', info.messageId);
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
