import request from 'superagent';
import buffer from 'buffer';
import _ from 'lodash';
import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments,
} from '../../models/documents';
import { User } from '../../models/user';

const { DIGIO_BASE_URL, DIGIO_CLIENT, DIGIO_SECRET } = process.env;
const { BASE_64_TOKEN } = buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

export const getDocumentsAll = (req, res) => {
  getAllDocuments().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsStatus = (req, res) => {
  const { status } = req.body;
  getDocumentsByStatus(status).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsByUserId = (req, res) => {
  const { user_id } = req.body;
  getDocumentsByUser(user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getDocumentsByID = (req, res) => {
  const { id } = req.params;
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
  expire_in_days) => {
  const requestObject = {
    template_values,
    signers,
    sign_coordinates,
    expire_in_days,
  };

  return (request
    .post(`${DIGIO_BASE_URL}v2/client/template/${template_id}/create_sign_request`)
    .send(requestObject)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => data)
    .catch(err => {
      console.log(err);
      let data = { message: 'Failed to send Esign request', status: 'Failure' };
      return data;
    })
  );
};

// TODO: Testing pending
export const EsignRequest = (req, res) => {
  const { id } = req.params;

  const {
    template_values,
    signers,
    template_id,
    sign_coordinates,
    expire_in_days,
  } = req.body;

  return User.findOne(
    {
      where: { id },
      attributes: ['name', 'email', 'profile'],
    },
  ).then(userDetails => {
    if ('personal_details' in userDetails.profile) {
      template_values.learner_email = userDetails.email;
      template_values.learner_name = userDetails.name;
      template_values.learner_address = userDetails.profile.personal_details.learner_address;
      template_values.guardian_email = userDetails.profile.personal_details.guardian_email;
      template_values.guardian_name = userDetails.profile.personal_details.guardian_name;
      template_values.guardian_address = userDetails.profile.personal_details.guardian_address;
      template_values.learner_witness = userDetails.profile.personal_details.learner_witness;
      template_values.guardian_witness = userDetails.profile.personal_details.guardian_witness;
    } else {
      const personalDetails = _.cloneDeep(template_values);
      userDetails.profile.personal_details = personalDetails;
      User({
        profile: userDetails.profile,
      }, {
        where: { id },
        returning: true,
        raw: true,
      });
    }

    return Esign(template_values,
      signers,
      template_id,
      sign_coordinates,
      expire_in_days).then(esignStatus => res.json(esignStatus));
  });
};
