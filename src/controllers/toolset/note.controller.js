import Resource from '../../models/note';
import logger from '../../util/logger';

export const getStudentNotes = (req, res) => {
  Resource.find({
    user: req.params.studentID,
  }).exec().then(data => res.json({ data })).catch((err) => {
    logger.error(err);
    res.status(500).send(err);
  });
};

export const getAll = (req, res) => {
  // logger.info(' in get all');
  Resource.find().exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Resource.findById(req.params.id).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  // logger.info('In create Note');
  const {
    text, user, color, createdTime,
  } = req.body;
  // logger.info(req);
  new Resource({
    text, user, color, createdTime,
  }).save()
    .then(data => res.status(201).json({ data }))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const update = (req, res) => {
  const { text, color, deleted } = req.body;
  Resource.findByIdAndUpdate(req.params.id, { text, color, deleted })
    .then((data) => {
      res.json({ data });
      // logger.info(data);
    })
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Resource.remove({ _id: req.params.id }).exec()
    .then(data => res.send(data))
    .catch(err => res.status(500).send(err));
};
