import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import Resource from '../../models/resource';
import ResourceComment from '../../models/resource_comment';
import ResourceReport from '../../models/resource_report';
import ResourceVote from '../../models/resource_vote';

export const getLatest = (req, res) => {
  Resource.findAll({
    order: [
      ['add_time', 'DESC'],
    ],
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getTop = (req, res) => {
  ResourceVote.findAll({
    attributes: ['resource_id', [Sequelize.fn('count', Sequelize.col('resource_id')), 'count']],
    group: ['resource_votes.resource_id'],
    raw: true,
    order: Sequelize.literal('count DESC'),
  })
    .then(async (data1) => {
      const arr = [];
      for (var i = 0; i < data1.length; i++) {
        arr.push(data1[i].resource_id);
      }
      const result = [];
      for (var i = 0; i < arr.length; i++) {
        const promise = Resource.findAll({
          attributes: ['url'],
          where: {
            id: arr[i],
          },
        })
          .then((data) => { result.push(data); });
        const k = await promise;
      }
      res.json(result);
    })
    .catch(err => res.status(500).send(err));
};

// todo: Implement trending logic using google's trending url api
export const getTrending = getTop;

export const getAll = (req, res) => {
  Resource.findAll({})
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Resource.findAll({
    where: {
      id: req.params.resource_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  const {
    topic_id, url, type, level,
  } = req.body;
  Resource.create({
    id: uuid(),
    owner: uuid(), // todo: Add the user's id here after auth is set
    moderator: uuid(),
    program: 'tep',
    add_time: Date.now(),
    topic_id,
    url,
    type,
    level,
  })
    .then((tepResource) => {
      res.send({
        data: tepResource,
      });
    })
    .catch(err => console.log(err));
};

export const update = (req, res) => {
  Resource.update({ url: req.body.url }, {
    where: {
      id: req.params.resource_id,
    },
  })
    .then((tepResource) => {
      res.send('Resource updated');
    })
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Resource.destroy({
    where: {
      id: req.params.resource_id,
    },
  })
    .then(() => { res.send('Deleted resource'); })
    .catch(err => res.status(500).send(err));
};

export const getComments = (req, res) => {
  ResourceComment.findAll({
    where: {
      resource_id: req.params.resource_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const addComment = (req, res) => {
  const resource_id = req.params.resource_id;
  const { comment } = req.body;
  return ResourceComment.create({
    resource_id, comment,
  })
    .then((tepResourceComment) => {
      res.send({
        data: tepResourceComment,
      });
    })
    .catch(err => res.status(500).send(err));
};

export const deleteComment = (req, res) => {
  ResourceComment.destroy({
    where: {
      id: req.params.comment_id,
    },
  })
    .then(() => { res.send('Comment Deleted'); })
    .catch(err => res.status(500).send(err));
};

export const upvote = (req, res) => {
  const id = uuid();
  const user_id = uuid();
  const resource_id = req.params.resource_id;
  const vote = 'upvote';
  return ResourceVote.create({
    id, user_id, resource_id, vote,
  })
    .then((tepResourceVote) => {
      res.send({
        data: tepResourceVote,
      });
    })
    .catch(err => res.status(500).send(err));
};

export const unvote = (req, res) => {
  ResourceVote.destroy({
    where: {
      resource_id: req.params.resource_id,
      user_id: req.body.user_id,
    },
  })
    .then(() => res.send('Vote deleted'))
    .catch(err => res.status(500).send(err));
};

export const getReports = (req, res) => {
  ResourceReport.findAll({})
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const addReport = (req, res) => {
  const id = uuid();
  const resource_id = req.params.resource_id;
  const report = req.body.report;
  console.log(id, resource_id, report);
  return ResourceReport.create({
    id, resource_id, report,
  })
    .then((tepResourceReport) => {
      res.send({
        data: tepResourceReport,
      });
    })
    .catch(err => res.status(500).send(err));
};

export const resolveReport = (req, res) => {
  ResourceReport.update(
    {
      status: 'resolved',
    },
    {
      where: {
        id: req.params.report_id,
      },
    },
  )
    .then((tepResourceReport) => {
      res.send('Report updated');
    })
    .catch(err => res.status(500).send(err));
};

export const getUnmoderated = (req, res) => {
  Resource.findAll({
    where: {
      moderator: null,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const approve = (req, res) => {
  Resource.update(
    {
      moderator: uuid(),
    },
    {
      where: {
        id: req.params.resource_id,
      },
    },
  )
    .then((tepResource) => {
      res.send('Resource approved');
    })
    .catch(err => res.status(500).send(err));
};
