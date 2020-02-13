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

export const getResourcesByTag = tag => Resource.findAll({
  where: {
    tags: {
      [contains]: [tag],
    },
  },
  raw: true,
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

// todo: find a way to remove hardcoding of firewall tags
const firewallTags = ['firewall_know', 'firewall_think', 'firewall_play', 'firewall_reflect'];
export const getFirewallResourceCount = getResourceCountByTags.bind(null, firewallTags);

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
