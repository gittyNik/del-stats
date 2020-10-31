import request from 'superagent';
import _ from 'lodash';
import AWS from 'aws-sdk';
import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments, insertIndividualDocument,
} from '../../models/documents';
import { User } from '../../models/user';

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
  const { status } = req.query;
  getDocumentsByStatus(status).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsByUserId = (req, res) => {
  const { user_id } = req.query;
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
  createUserEntry(user_id,
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified).then((data) => { res.json(data); })
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
      let data = { message: 'Failed to send Esign request', status: 'Failure' };
      return data;
    })
  );
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
      createUserEntry(id, esignStatus, 'requested');
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

    let response = await signedViewUrl(fileName, fileType, bucketName, basePath);
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

export const insertUserDocument = async (req, res) => {
  const { document } = req.body;
  const user_id = req.jwtData.user.id;
  try {
    let response = await insertIndividualDocument(user_id, document);
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
