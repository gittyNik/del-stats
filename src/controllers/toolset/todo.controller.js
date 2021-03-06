import Todo from '../../models/todo';
import logger from '../../util/logger';

export const getStudentToDos = (req, res) => {
  Todo.find({
    student: req.params.studentID,
  }).exec()
    .then(data => res.json({ data }))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const getAll = (req, res) => {
  Todo.find().exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Todo.findById(req.params.id).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  const {
    text, student, createTime, color,
  } = req.body;
  new Todo({
    text, student, createTime, color,
  }).save()
    .then((data) => {
      // logger.info({ data });
      res.status(201).json({ data });
    })
    .catch(err => res.status(500).send(err));
};

export const update = (req, res) => {
  const todo = req.body;
  // todo: check if the currentCohort is valid and then continue
  Todo.findByIdAndUpdate(req.params.id, todo)
    .then(data => res.json({ data }))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const deleteOne = (req, res) => {
  Todo.remove({ _id: req.params.id }).exec()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).send(err));
};

export const updateAll = (req, res) => {
  Todo.update({}, { $set: { done: true } }, { multi: true })
    .then(data => res.json({ data }))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const deleteMultiple = (req, res) => {
  Todo.update({ done: true }, { $set: { deleted: true } }, { multi: true })
    .then(data => res.json({ data }))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};
