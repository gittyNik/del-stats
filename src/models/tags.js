import Sequelize from 'sequelize';
import db from '../database';

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
      },
    ),
    allowNull: true,
  },
  description: Sequelize.TEXT,
  source: Sequelize.STRING, // slack/web
  details: Sequelize.JSON,
  parent_tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
    allowNull: true,
  },
  child_tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
    allowNull: true,
  },
  similar_tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
    allowNull: true,
  },
});

export const getTagIdbyName = tag_name => Tags.findOne({
  where: {
    tag_name,
  },
  raw: true,
});

export const getTagIdbyNames = tag_names => Tags.findAll({
  where: {
    tag_name: tag_names,
  },
  raw: true,
});
