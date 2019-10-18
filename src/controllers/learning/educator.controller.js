import Resource, { USER_ROLES } from '../../models/user';

export const getAll = (req, res) => {
  Resource.find({ $or: [{ role: USER_ROLES.EDUCATOR }, { role: USER_ROLES.SUPERADMIN }] }).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Resource.findById(req.params.id).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  console.log(req);
  const {
    name, email, profile, role,
  } = req.body;
  new Resource({
    name, email, profile, role,
  }).save()
    .then(data => res.status(201).json({ data }))
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const update = (req, res) => {
  Resource.findByIdAndUpdate(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Resource.remove({ _id: req.params.id }).exec()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).send(err));
};
