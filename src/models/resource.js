import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';

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
    type: Sequelize.BLOB,
    unique: true,
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
    type: Sequelize.ENUM('beginner', 'advanced'),
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
  },
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  source: Sequelize.STRING, // slack/web
  details: Sequelize.JSON,
});

const { contains } = Sequelize.Op;

export const getResourcesByTag = tag => {
  console.log(tag, tag, tag, '\n\n\n');

  return Resource.findAll({
    where: {
      tags: {
        [contains]: [tag],
      },
    },
    raw: true,
  });
};

const getResourceCountByTag = tag => Resource.aggregate('id', 'count', {
  where: {
    tags: {
      [contains]: [tag],
    },
  },
  distinct: true,
});

export const getFirewallResourceCount = getResourceCountByTag.bind(null, 'firewall');

export const createFromSlackAttachment = (attachment, owner) => Resource.create({
  id: uuid(),
  url: attachment.original_url || attachment.app_unfurl_url,
  type: 'article',
  level: 'beginner',
  owner,
  title: attachment.title,
  description: attachment.text,
  source: 'slack',
  details: { slack: attachment },
});

export const searchResources = text => {
  console.log(`searching for: ${text}`);
  // TODO: important: remove special chars from text
  return db.query("SELECT * FROM resources where lower(CONCAT(title, ' ', description)) like :match;", {
    model: Resource,
    replacements: { match: `%${text}%` },
  });
};
