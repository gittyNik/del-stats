import { Student, USER_ROLES } from '../models/user';

export const getCohortStudents = cohort => Student.find({
  currentCohort: cohort._id,
  role: USER_ROLES.STUDENT,
}).exec();

export const getAll = (req, res) => {
  Student.find().exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Student.findById(req.params.id).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  const {
    name, email, profile, role, cohorts, currentCohort,
  } = req.body;
  new Student({
    name, email, profile, role, cohorts, currentCohort,
  }).save()
    .then((data) => {
      console.log({ data });
      res.status(201).json({ data });
    })
    .catch(err => res.status(500).send(err));
};

export const update = (req, res) => {
  const data = req.body;
  // todo: check if the currentCohort is valid and then continue
  Student.findByIdAndUpdate(req.params.id, data)
    .then(data => res.json({ data }))
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const deleteOne = (req, res) => {
  Student.remove({ _id: req.params.id }).exec()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).send(err));
};
