import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import logger from '../util/logger';

export const ResourceVisit = db.define('resource_visits', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  resource_id: {
    type: Sequelize.UUID,
    references: { model: 'resources', key: 'id' },
  },
  user_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  source: Sequelize.STRING,
  details: Sequelize.JSON, // keywords, tags, prev_link etc
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,
});

export const logResourceVisitByFirewallUser = (resource_id, user_id) => ResourceVisit.create({
  id: uuid(),
  user_id,
  resource_id,
  source: 'web',
  details: {
    isFirewall: true,
  },
});

export const getFirewallResourceVisitsByUser = user_id =>
  // logger.info(user_id);
  ResourceVisit.aggregate('resource_id', 'count', {
    where: {
      user_id,
      'details.isFirewall': true,
    },
    distinct: true,
  });
