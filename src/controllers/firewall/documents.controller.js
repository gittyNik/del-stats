import request from 'superagent';
import _ from 'lodash';
import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments,
} from '../../models/documents';
import { User } from '../../models/user';

const { DIGIO_BASE_URL, DIGIO_CLIENT, DIGIO_SECRET } = process.env;

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

  console.log(DIGIO_CLIENT, DIGIO_SECRET);
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
    if ((_.isEmpty(userDetails)) && (_.isEmpty(userDetails.profile)) && ('personal_details' in userDetails.profile)) {
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
      console.log(updatedProfile);
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
