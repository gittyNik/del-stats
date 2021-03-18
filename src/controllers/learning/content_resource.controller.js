import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import {
  Resource, getResourcesByTag, getResourceByUrl, createResource, autoTagUrls, searchResources, getResourceByTopic,
} from '../../models/resource';
import { ResourceComment } from '../../models/resource_comment';
import { ResourceReport } from '../../models/resource_report';
import { ResourceVote } from '../../models/resource_vote';
import { logResourceVisitByFirewallUser } from '../../models/resource_visit';
import logger from '../../util/logger';

export const getLatest = (req, res) => {
  Resource.findAll({
    order: [
      ['add_time', 'DESC'],
    ],
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getFirewall = (req, res) => {
  const firewall_sections = ['know', 'think', 'play', 'reflect'];

  Promise.all(firewall_sections.map(section => getResourcesByTag(`firewall_${section}`)))
    .then(([know, think, play, reflect]) => ({
      know, think, play, reflect,
    }))
    .then(data => {
      // logger.info(data);
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const getTaggedResources = (req, res) => {
  const { tag } = req.params;
  getResourcesByTag(tag)
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const searchTaggedResources = (req, res) => {
  const { text } = req.query;
  // logger.info(text);
  searchResources(text.toLowerCase())
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const logResourceVisit = (req, res) => {
  const { resource_id } = req.params;
  const user_id = req.jwtData.user.id;

  logResourceVisitByFirewallUser(resource_id, user_id)
    .then(visit => {
      // logger.info(visit);
      res.send({
        text: 'Successfully logged',
      });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
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
      for (let i = 0; i < data1.length; ++i) {
        arr.push(data1[i].resource_id);
      }
      const result = [];
      const promises = [];
      for (let i = 0; i < arr.length; ++i) {
        const promise = Resource.findAll({
          attributes: ['url'],
          where: {
            id: arr[i],
          },
        })
          .then((data) => { result.push(data); });
        promises.push(promise);
      }
      await Promise.all(promises);
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

export const getResourceUrl = (req, res) => {
  const { url } = req.body;
  getResourceByUrl(url)
    .then(data => {
      // logger.info(data);
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const getTopicResource = (req, res) => {
  const { topic_id } = req.params;
  getResourceByTopic(topic_id)
    .then(data => {
      // logger.info(data);
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const create = (req, res) => {
  const {
    url, topic_id,
  } = req.body;
  getResourceByUrl(url)
    .then(data => {
      // logger.info(data);
      if (data) {
        res.send({ data });
      } else {
        autoTagUrls(url)
          .then(response_data => {
            const level = 'beginner';
            const owner = req.jwtData.user.id;
            const type = 'article'; // TODO : Add other types to enum
            const source = 'web';
            const {
              predicted_tag_ids, description, title, thumbnail_url,
            } = response_data.body.data;
            createResource(
              url, level, owner, predicted_tag_ids,
              title, description, source, type, data, thumbnail_url,
              topic_id,
            ).then(resource_added => {
              res.json({ text: 'Added Resource', data: resource_added });
            })
              .catch(err => {
                logger.error(err);
                res.sendStatus(500);
              });
          })
          .catch(err => {
            logger.error(err);
            res.sendStatus(500);
          });
      }
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const update = (req, res) => {
  Resource.update({ url: req.body.url }, {
    where: {
      id: req.params.resource_id,
    },
  })
    .then(() => {
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
  const { resource_id } = req.params;
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
  const { resource_id } = req.params;
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
  const { resource_id } = req.params;
  const { report } = req.body;
  // logger.info(id, resource_id, report);
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
    .then(() => {
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
    .then(() => {
      res.send('Resource approved');
    })
    .catch(err => res.status(500).send(err));
};
