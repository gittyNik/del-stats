import request from 'superagent';
import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments,
} from '../../models/documents';

const { DIGIO_BASE_URL, DIGIO_CLIENT, DIGIO_SECRET } = process.env;
const { BASE_64_TOKEN } = Buffer.from(`${DIGIO_CLIENT}:${DIGIO_SECRET}`).toString('base64');

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

export const EsignRequest = (req, res) => {
  const { id } = req.params;
  const {
    template_values,
    signers,
    template_id,
  } = req.body;

  const requestObject = {
    template_values,
    signers,
  };

  return (request
    .post(`${DIGIO_BASE_URL}v2/client/template/${template_id}/create_sign_request`) // todo: need to assign delta user to zoom user
    .send(requestObject)
    .set('Authorization', `Basic ${BASE_64_TOKEN}`)
    .set('content-type', 'application/json')
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      let data = { message: 'Failed to send Esign request', status: 'Failure' };
      res.json(data);
    })
  );
};
