import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Resource } from './resource';

export const Tags = db.define('tags', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  tag_name: Sequelize.STRING,
  topic_id: {
    type: Sequelize.UUID,
    allowNull: true,
    references: { model: 'topics' },
  },
  add_time: {
    type: Sequelize.DATE, // after moderation
  },
  owner: {
    type: Sequelize.UUID,
    references: { model: 'users' },
  },
  moderator: {
    type: Sequelize.ARRAY(
        {
            type: Sequelize.UUID,
            references: { model: 'users' },
        }
    ),
    allowNull: true,
  },
  description: Sequelize.TEXT,
  source: Sequelize.STRING, // slack/web
  details: Sequelize.JSON,
  parent_tags: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: true
  },
  child_tags: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: true
  }
});

const { contains, overlap } = Sequelize.Op;

export const getResourcesByTag = tag_id => Tags.findByPk(tag_id, {
    include: [Resource],
  });
