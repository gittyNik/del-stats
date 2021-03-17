import AWS from 'aws-sdk';
import logger from './logger';

const privateKey = process.env.CLOUDFRONT_KEY.replace(/\\n/g, '\n');
const publicKey = process.env.PUBLIC_KEY;

const cloudFront = new AWS.CloudFront.Signer(publicKey, privateKey);

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
  VIDEO_CDN, AGREEMENTS_CDN, TEMPLATES_CDN, LEARNER_CDN,
  HIRING_COMPANIES_CDN,
} = process.env;

const s3 = new AWS.S3({
  endpoint: 's3-ap-south-1.amazonaws.com',
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET,
  signatureVersion: 'v4',
  region: AWS_REGION,
});

export const type_upload = {
  video: {
    bucketName: AWS_BREAKOUTS_BUCKET_NAME,
    basePath: AWS_BREAKOUTS_BASE_PATH,
    cdn: VIDEO_CDN,
  },
  agreement: {
    bucketName: AWS_AGREEMENTS_BUCKET_NAME,
    basePath: AWS_AGREEMENTS_BASE_PATH,
    cdn: AGREEMENTS_CDN,
  },
  emailer: {
    bucketName: AWS_BUCKET_NAME,
    basePath: AWS_BASE_PATH,
    cdn: TEMPLATES_CDN,
  },
  document: {
    bucketName: AWS_DOCUMENT_BUCKET,
    basePath: AWS_DOCUMENT_BASE_PATH,
    cdn: AGREEMENTS_CDN,
  },
  resume: {
    bucketName: AWS_RESUME_BUCKET_NAME,
    basePath: AWS_RESUME_BASE_PATH,
    cdn: LEARNER_CDN,
  },
  company_logo: {
    bucketName: AWS_COMPANY_BUCKET_NAME,
    basePath: AWS_COMPANY_LOGO_BASE_PATH,
    cdn: HIRING_COMPANIES_CDN,
  },
  profile_picture: {
    bucketName: AWS_LEARNER_PROFILE_BUCKET,
    basePath: AWS_LEARNER_PROFILE_BASE_PATH,
    cdn: LEARNER_CDN,
  },
};

export const getAWSSignedUrl = (unSignedUrl) => {
  let signedUrl = '';
  cloudFront.getSignedUrl({
    url: unSignedUrl,
    expires: Math.floor((new Date()).getTime() / 1000) + (60 * 60 * 1),
    // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
  }, (err, url) => {
    if (err) throw err;
    signedUrl = url;
  });
  return signedUrl;
};

export const getResourceUrl = (cdn, base_path) => {
  let cdn_url = cdn + base_path;
  let url = getAWSSignedUrl(cdn_url);
  return url;
};

export const downloadFile = async (bucket, objectKey) => {
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
};

export const uploadFile = async (bucket, objectKey, body, contentType) => {
  try {
    const params = {
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    };

    const data = await s3.putObject(params).promise();
    return data;
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
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
    Expires: 7200, // 7200s
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

export const getViewUrlS3 = async (fileName, type) => {
  try {
    let { cdn, basePath } = type_upload[type];
    let filePath;
    if ((fileName.indexOf(basePath) === 0) || (fileName.indexOf(basePath) === 1)) {
      filePath = fileName;
    } else {
      filePath = `${basePath}/${fileName}`;
    }
    let response = await getResourceUrl(cdn, filePath);
    return response;
  } catch (err) {
    logger.error(err);
    return null;
  }
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
