import {
  getDocumentsByStatus, getDocumentsByUser,
  getDocumentsFromId, createUserEntry, updateUserEntry,
  getAllDocuments,
} from '../../models/documents';

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
