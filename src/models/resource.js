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
    references: { model: 'topics', key: 'id' },
  },
  url: {
    type: Sequelize.STRING,
    unique: true,
  },
  owner: {
    type: Sequelize.UUID,
  },
  moderator: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  thumbnail: {
    type: Sequelize.BLOB,
    unique: true,
  },
  type: {
    type: Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
    allowNull: false,
  },
  program: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'tep',
  },
  add_time: {
    type: Sequelize.DATE,
  },
  level: {
    type: Sequelize.ENUM('beginner', 'advanced'),
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
  },
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

export const createFromSlackAttachment = attachment => Resource.create({
  id: uuid(),
  url: attachment.original_url,
  type: 'article',
  level: 'beginner',
});
