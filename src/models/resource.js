import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import 'dotenv/config';
import request from 'superagent';
import { getTagIdbyName } from './tags';

const {
  AUTO_TAGGER_URL: autotag_url
} = process.env;

export const Resource = db.define('resources', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topic_id: {
    type: Sequelize.UUID,
    allowNull: true,
    references: { model: 'topics' },
  },
  url: {
    type: Sequelize.STRING,
    unique: true,
  },
  owner: {
    type: Sequelize.UUID,
    references: { model: 'users' },
  },
  moderator: {
    type: Sequelize.UUID,
    allowNull: true,
    references: { model: 'users' },
  },
  thumbnail: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  type: {
    type: Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
    allowNull: false,
    defaultValue: 'article',
  },
  program: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'demo',
    references: { model: 'programs', key: 'id' },
  },
  add_time: {
    type: Sequelize.DATE, // after moderation
  },
  level: {
    type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
  },
  tagged: {
    type: Sequelize.ARRAY({
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'topics' }
    })
  },
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  source: Sequelize.STRING, // slack/web
  details: Sequelize.JSON,
});

const { contains, overlap } = Sequelize.Op;

export const getResourcesByTag = tag => 
  getTagIdbyName(tag)
    .then(data => {
      const tag_id = data.id;
      return Resource.findAll({
        where: {
          tagged: {
            [contains]: [tag_id],
          },
        },
        raw: true,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
});

export const getResourcesByTags = tags =>
  getTagIdbyNames(tags)
    .then(data => {
      const tag_id = data.id;
      return Resource.findAll({
        where: {
          tagged: {
            [contains]: [tag_id],
          },
        },
        raw: true,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
});

const getResourceCountByTags = tags => Resource.aggregate('id', 'count', {
  where: {
    tags: {
      [overlap]: tags,
    },
  },
  distinct: true,
})
  .then(count => +count);

export const getResourceByUrl = url => Resource.findOne({
  where: {
    url: url
  },
  raw: true,
});

// todo: find a way to remove hardcoding of firewall tags
const firewallTags = ['firewall_know', 'firewall_think', 'firewall_play', 'firewall_reflect'];
export const getFirewallResourceCount = getResourceCountByTags.bind(null, firewallTags);

export const autoTagUrls = (url) => 
  request
  .post(autotag_url, { url })
  .then((response_data) => {
    return response_data;
    }).catch(err => {
          console.error("###########",err);
          res.sendStatus(500);
});

export const createResource = (url, level, owner, tagged, title='', description='', source='slack', type='article', details={}, thumbnail='', program='tep') => 
  Resource.create({
    id: uuid(),
    url,
    type,
    level,
    owner,
    title,
    description,
    source,
    details,
    tagged,
    program,
    thumbnail
  })


export const createFromSlackAttachment = (attachment, owner) => {
  autoTagUrls(url)
    .then(data => {
      const {tagged=predicted_tag_ids} = response_data.body.data;;
      return createResource(url = attachment.original_url || attachment.app_unfurl_url,
        type =  'article',
        level= 'beginner',
        owner,
        title = attachment.title,
        description = attachment.text,
        source = 'slack',
        details = { slack: attachment },
        tagged
      )
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
}

export const searchResources = text => {
  console.log(`searching for: ${text}`);
  // TODO: important: remove special chars from text
  return db.query("SELECT * FROM resources where lower(CONCAT(title, ' ', description)) like :match;", {
    model: Resource,
    replacements: { match: `%${text}%` },
  });
};
