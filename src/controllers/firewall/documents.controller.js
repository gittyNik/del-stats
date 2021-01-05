import request from 'superagent';
import _ from 'lodash';
import AWS from 'aws-sdk';
import axios from 'axios';
import crypto from 'crypto';

import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments, insertIndividualDocument,
  verifySingleUserDocument,
  updateMandateDetailsForLearner, updateDebitDetailsForLearner,
} from '../../models/documents';
import { User } from '../../models/user';
import { uploadFile } from '../emailer/emailer.controller';

const {
  AWS_DOCUMENT_BUCKET,
  AWS_DOCUMENT_BASE_PATH,
  AWS_AGREEMENTS_BASE_PATH, AWS_ACCESS_KEY,
  AWS_SECRET, AWS_REGION, AWS_BASE_PATH,
  AWS_BREAKOUTS_BASE_PATH, AWS_BREAKOUTS_BUCKET_NAME,
  AWS_AGREEMENTS_BUCKET_NAME, AWS_BUCKET_NAME,
  AWS_RESUME_BUCKET_NAME, AWS_RESUME_BASE_PATH,
  AWS_COMPANY_BUCKET_NAME, AWS_COMPANY_LOGO_BASE_PATH,
  AWS_LEARNER_PROFILE_BUCKET, AWS_LEARNER_PROFILE_BASE_PATH,
} = process.env;

AWS.config.update(
  {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
    region: AWS_REGION,
  },
);
const s3 = new AWS.S3({
  endpoint: 's3-ap-south-1.amazonaws.com',
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET,
  signatureVersion: 'v4',
  region: AWS_REGION,
});

const type_upload = {
  video: {
    bucketName: AWS_BREAKOUTS_BUCKET_NAME,
    basePath: AWS_BREAKOUTS_BASE_PATH,
  },
  agreement: {
    bucketName: AWS_AGREEMENTS_BUCKET_NAME,
    basePath: AWS_AGREEMENTS_BASE_PATH,
  },
  emailer: {
    bucketName: AWS_BUCKET_NAME,
    basePath: AWS_BASE_PATH,
  },
  document: {
    bucketName: AWS_DOCUMENT_BUCKET,
    basePath: AWS_DOCUMENT_BASE_PATH,
  },
  resume: {
    bucketName: AWS_RESUME_BUCKET_NAME,
    basePath: AWS_RESUME_BASE_PATH,
  },
  company_logo: {
    bucketName: AWS_COMPANY_BUCKET_NAME,
    basePath: AWS_COMPANY_LOGO_BASE_PATH,
  },
  profile_picture: {
    bucketName: AWS_LEARNER_PROFILE_BUCKET,
    basePath: AWS_LEARNER_PROFILE_BASE_PATH,
  },
};

const { DIGIO_BASE_URL, DIGIO_CLIENT, DIGIO_SECRET } = process.env;

export const getDocumentsAll = (req, res) => {
  getAllDocuments().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsStatus = (req, res) => {
  const { status } = req.params;
  getDocumentsByStatus(status).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsByUserId = (req, res) => {
  const { user_id } = req.params;

  getDocumentsByUser(user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsByID = (req, res) => {
  const { id } = req.query;
  getDocumentsFromId(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createUser = (req, res) => {
  const {
    user_id,
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified,
  } = req.body;
  createUserEntry({
    user_id,
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified,
  }).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateUser = (req, res) => {
  const {
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified,
  } = req.body;
  const { id } = req.params;
  updateUserEntry(id,
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getEnachDetails = (mandate_id) => {
  const BASE_64_TOKEN = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

  return (request
    .get(`${DIGIO_BASE_URL}v3/client/mandate/${mandate_id}`)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => data)
    .catch(err => {
      console.error(err);
      let data = { message: `Failed to send Enach request: ${err}`, status: 'Failure' };
      return data;
    })
  );
};

export const saveEnachDetails = async (mandate_id, user_id) => {
  let enachDetails = await getEnachDetails(mandate_id);

  let updatedDocument = await updateUserEntry({
    user_id,
    mandate_id,
    mandate_details: enachDetails.body,
  });

  return updatedDocument;
};

export const saveEnachMandate = (req, res) => {
  const { mandate_id, user_id } = req.body;

  saveEnachDetails(mandate_id, user_id)
    .then((data) => res.json({
      text: data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

export const createMandateRequest = (
  {
    customer_email, mandate_amount,
    activation_date, is_recurring,
    frequency, user_id,
    customer_name, customer_account_number,
    customer_bank_ifsc, customer_account_type,
    customer_ref_number,
  },
) => {
  const BASE_64_TOKEN = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

  const requestObject = {
    customer_identifier: customer_email,
    auth_mode: 'api',
    mandate_type: 'create',
    corporate_config_id: process.env.CORPORATE_CONFIG_ID,
    mandate_data: {
      maximum_amount: mandate_amount,
      instrument_type: 'debit',
      first_collection_date: activation_date,
      is_recurring,
      frequency,
      management_category: 'A001',
      customer_name,
      customer_account_number,
      destination_bank_id: customer_bank_ifsc,
      customer_account_type,
      customer_ref_number,
    },

  };

  return (request
    .post(`${DIGIO_BASE_URL}v3/client/mandate/create_form`)
    .send(requestObject)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => data)
    .catch(err => {
      let message = err.response.body;
      console.error(message);
      throw Error(message.message);
    })
  );
};

export const createDebitRequest = (
  settlement_date, frequency,
  amount, dest_ifsc, dest_acc_no,
  customer_name, umrn,
) => {
  const BASE_64_TOKEN = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

  const requestObject = {
    umrn,
    amount,
    settlement_date,
    corporate_account_number: process.env.PAYMENT_ACC_NUMBER,
    corporate_config_id: process.env.CORPORATE_CONFIG_ID,
    destination_bank_id: dest_ifsc,
    customer_account_number: dest_acc_no,
    customer_name,
    frequency,
  };

  return (request
    .post(`${DIGIO_BASE_URL}v3/client/nach_debit/scheduled/register`)
    .send(requestObject)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => data)
    .catch(err => {
      let message = err.response.body;
      console.error(message);
      throw Error(message.message);
    })
  );
};

export const saveDebitRequest = async (settlement_date, frequency,
  amount, dest_ifsc, dest_acc_no,
  customer_name, user_id, umrn) => {
  const triggerDebit = await createDebitRequest(
    settlement_date, frequency,
    amount, dest_ifsc, dest_acc_no,
    customer_name, umrn,
  );

  let nach_debit_details = triggerDebit.body;

  let nach_debit_id = nach_debit_details.id;

  return updateUserEntry({ user_id, nach_debit_id, nach_debit_details });
};

export const saveMandateDetails = async ({
  customer_email, mandate_amount,
  activation_date, is_recurring,
  frequency, user_id,
  customer_name, customer_account_number,
  customer_bank_ifsc, customer_account_type,
}) => {
  // Create random alphanumeric string which can be shared with users for tracking
  const customer_ref_number = (+new Date()).toString(36).slice(-8);
  console.log(customer_ref_number);

  // Send api request for mandate creation
  const mandateResponse = await createMandateRequest({
    customer_email,
    mandate_amount,
    activation_date,
    is_recurring,
    frequency,
    user_id,
    customer_name,
    customer_account_number,
    customer_bank_ifsc,
    customer_account_type,
    customer_ref_number,
  });

  let mandateDetails = JSON.parse(mandateResponse.text);

  return updateUserEntry({
    user_id,
    mandate_id: mandateDetails.mandate_id,
    mandate_details: mandateDetails,
  });
};

export const createMandate = (req, res) => {
  const {
    customer_email, mandate_amount,
    activation_date, is_recurring,
    frequency, user_id,
    customer_name, customer_account_number,
    customer_bank_ifsc, customer_account_type,
    customer_ref_number,
  } = req.body;

  // Frequency Options:
  // Adhoc[means “As on when presented”]
  // IntraDay
  // Daily
  // Weekly
  // Monthly
  // BiMonthly
  // Quarterly
  // Semiannually
  // Yearly

  saveMandateDetails({
    customer_email,
    mandate_amount,
    activation_date,
    is_recurring,
    frequency,
    user_id,
    customer_name,
    customer_account_number,
    customer_bank_ifsc,
    customer_account_type,
    customer_ref_number,
  })
    .then((data) => res.json({
      text: data,
    }))
    .catch((err) => {
      console.error(err);
      return res.status(500);
    });
};

export const createDebitRequestNach = (req, res) => {
  const {
    settlement_date, frequency,
    amount, dest_ifsc, dest_acc_no,
    customer_name, learner_id, umrn,
  } = req.body;

  saveDebitRequest(settlement_date, frequency,
    amount, dest_ifsc, dest_acc_no,
    customer_name, learner_id, umrn)
    .then((data) => res.json({
      text: data,
    }))
    .catch((err) => {
      console.error(err);
      return res.status(500);
    });
};

export const Esign = (template_values, signers,
  template_id,
  sign_coordinates,
  expire_in_days,
  notify_signers,
  send_sign_link,
  file_name) => {
  const requestObject = {
    template_values,
    signers,
    sign_coordinates,
    expire_in_days,
    send_sign_link,
    file_name,
    notify_signers,
  };
  const BASE_64_TOKEN = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

  // console.log(DIGIO_CLIENT, DIGIO_SECRET);
  return (request
    .post(`${DIGIO_BASE_URL}v2/client/template/${template_id}/create_sign_request`)
    .send(requestObject)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => data)
    .catch(err => {
      console.error(err);
      let data = { message: `Failed to send Esign request: ${err}`, status: 'Failure' };
      return data;
    })
  );
};

const processWebHookData = async (entities, payload, id, event) => {
  let find_items = entities.filter(element => element.includes('mandate'));
  if (find_items.length > 0) {
    // Mandate details
    let mandate_details = payload.api_mandate;
    console.log(`Mandate ID for Enach: ${mandate_details.id}`);
    return updateMandateDetailsForLearner(mandate_details.id, mandate_details);
  }
  // eNach debit details
  let debit_details = payload.nach_debit;
  console.log(`Debit ID for Enach: ${debit_details.id}`);
  return updateDebitDetailsForLearner(debit_details.id, debit_details);
};

export const digioEnachWebHook = (req, res) => {
  const {
    entities, payload, id, event,
  } = req.body;

  console.debug('Request Body');
  console.debug(req.body);
  // console.debug('Request Headers');
  // console.debug(req.headers);

  let digioWebhookSecret = process.env.DIGIO_WEBHOOK_SECRET;
  const secretHash = crypto.createHmac('sha256', digioWebhookSecret).update(JSON.stringify(req.body));

  const checkSum = secretHash.digest('hex');

  // console.debug('checkSum');
  // console.debug(checkSum);

  const requestCheckSum = req.headers['x-digio-checksum'];
  // console.debug(requestCheckSum);

  if (requestCheckSum === checkSum) {
    return processWebHookData(entities, payload, id, event)
      .then((data) => {
        if (data[0] === 0) {
          console.error('Enach details does exist in documents');
          return res.status(500).send();
        }
        return res.json({
          data: data[1],
          message: 'Updated enach details',
          type: 'success',
        });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send();
      });
  }
  let message = 'Signatures does not match';
  return res.status(401).json({ message, type: 'failure' });
};

export const downloadEsignAgreement = async (user_id) => {
  let userDocument = await getDocumentsByUser(user_id);

  let esignDocumentDetails = userDocument.document_details.id;
  const BASE_64_TOKEN = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

  return axios.get(`${DIGIO_BASE_URL}v2/client/document/download?document_id=${esignDocumentDetails}`, {
    headers: {
      Authorization: `Basic ${BASE_64_TOKEN}`,
    },
    responseType: 'arraybuffer',
  })
    .then(async (res) => {
      let pdfFile = res.data;
      let { bucketName, basePath } = type_upload.agreement;
      let documentPath = `${basePath}/${userDocument.document_details.file_name}.pdf`;
      await uploadFile(bucketName, documentPath,
        pdfFile, 'application/pdf');
      userDocument.document_details.path = documentPath;
      return 'Document uploaded successfully!';
    })
    .catch((error) => {
      console.error(error);
      throw Error('Document download failed!');
    });
};

export const downloadEsignDocument = (req, res) => {
  const { id } = req.params;

  downloadEsignAgreement(id)
    .then((data) => res.json({
      text: data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

// TODO: Testing pending
// Will send Esign request from Digio to User
// Requires template id, user details to pre-fill in the agreement
// send date, signer email/mobile and sign co-ordinates
export const EsignRequest = (req, res) => {
  const { id } = req.params;

  const {
    template_values,
    template_id,
    sign_coordinates,
    expire_in_days,
    notify_signers,
    send_sign_link,
    file_name,
    signers,
  } = req.body;

  return User.findOne(
    {
      where: { id },
      attributes: ['name', 'email', 'profile'],
    },
  ).then(userDetails => {
    if ((_.isEmpty(userDetails)) && (_.isEmpty(userDetails.profile))
      && ('personal_details' in userDetails.profile)) {
      template_values.learner_email = userDetails.email;
      template_values.learner_name = userDetails.name;
      template_values.learner_address = userDetails.profile.personal_details.learner_address;
      template_values.guardian_email = userDetails.profile.personal_details.guardian_email;
      template_values.guardian_name = userDetails.profile.personal_details.guardian_name;
      template_values.guardian_address = userDetails.profile.personal_details.guardian_address;
      template_values.learner_witness = userDetails.profile.personal_details.learner_witness;
      template_values.guardian_witness = userDetails.profile.personal_details.guardian_witness;
    } else {
      // Deep cloning and saving user details in database
      const personalDetails = _.cloneDeep(template_values);
      delete personalDetails.document_send_date;
      let personDetails = { personal_details: personalDetails };
      let mergedUserDetails = { ...personDetails, ...userDetails.profile };
      let updatedProfile = User.update({
        profile: mergedUserDetails,
      }, { where: { id }, returning: true });
      // console.log(updatedProfile);
    }

    return Esign(template_values,
      signers,
      template_id,
      sign_coordinates,
      expire_in_days,
      notify_signers,
      send_sign_link,
      file_name).then(esignStatus => {
      createUserEntry({ user_id: id, document_details: JSON.parse(esignStatus.text), status: 'requested' });
      return res.json(esignStatus);
    });
  });
};

export const signedUploadUrl = async (
  fileName, fileType, bucket = AWS_DOCUMENT_BUCKET,
  base_path = AWS_DOCUMENT_BASE_PATH,
) => {
  let filePath = `${base_path}/${fileName}`;
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: bucket,
    Key: filePath,
    Expires: 500,
  };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    let s3Response = await s3.getSignedUrl('putObject', s3Params);
    const returnData = {
      signedRequest: s3Response,
      url: `https://${bucket}.s3.amazonaws.com/${filePath}`,
    };
    return returnData;
  } catch (err) {
    return err;
  }
};

export const signedViewUrl = async (
  fileName, fileType, bucket = AWS_DOCUMENT_BUCKET,
  base_path = AWS_DOCUMENT_BASE_PATH, full_path = true,
) => {
  let filePath;
  if (full_path) {
    filePath = fileName;
  } else {
    filePath = `${base_path}/${fileName}`;
  }
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: bucket,
    Key: filePath,
    Expires: 500,
  };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    let s3Response = await s3.getSignedUrl('getObject', s3Params);
    const returnData = {
      signedRequest: s3Response,
      url: `https://${bucket}.s3.amazonaws.com/${filePath}`,
    };
    return returnData;
  } catch (err) {
    return err;
  }
};

export const getViewUrlS3 = async (fileName, fileType, type) => {
  try {
    let { bucketName, basePath } = type_upload[type];

    let response = await signedViewUrl(fileName, fileType, bucketName, basePath, false);
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getSignUrl = async (req, res) => {
  const { fileName, fileType, type } = req.body;
  try {
    let { bucketName, basePath } = type_upload[type];

    let response = await signedUploadUrl(fileName, fileType, bucketName, basePath);
    return res.json({
      message: 'Signed url created successfully!',
      data: response,
      type: 'success',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Unable to generate sign request',
      type: 'failure',
    });
  }
};

/**
 *
 * @param {String} req.body.document_name Name of the Document
 * @param {Boolean} req.body.is_verified Default value is false
 * @param {String} req.body.document_path path to the uploaded document
 */
export const insertUserDocument = async (req, res) => {
  const { document_name, is_verified = false, document_path } = req.body;
  const { user_id } = req.params;
  try {
    let response = await insertIndividualDocument(user_id,
      { document_name, is_verified, document_path });
    return res.json({
      message: 'Document added successfully!',
      data: response,
      type: 'success',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Unable to save document',
      type: 'failure',
    });
  }
};

export const verifySingleUserDocumentAPI = async (req, res) => {
  const {
    document_name, is_verified, comment, learner_id,
  } = req.body;
  const user_id = req.jwtData.user.id;
  try {
    const response = await verifySingleUserDocument(learner_id,
      document_name, is_verified, comment, user_id);
    return res.status(201).json({
      message: 'Updated a single User document successfully!',
      data: response,
      type: 'success',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Unable to update user document',
      type: 'failure',
    });
  }
};
