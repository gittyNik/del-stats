import Sequelize from 'sequelize';
import request from 'superagent';
import uuid from 'uuid/v4';
import sw from 'stopword';
import db from '../database';
import 'dotenv/config';

import { getTagIdbyName } from './tags';

const {
  AUTO_TAGGER_URL: autotag_url,
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
      references: { model: 'topics' },
    }),
  },
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  source: Sequelize.STRING, // slack/web
  details: Sequelize.JSON,
});

const { contains, overlap } = Sequelize.Op;

export const getResourcesByTag = tag => getTagIdbyName(tag)
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
    return { message: 'Could not find resource' };
  });

export const getResourcesByTags = tags => getTagIdbyNames(tags)
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
    return { message: 'Could not find resource' };
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
    url,
  },
  raw: true,
});

export const getResourceByTopic = topic_id => Resource.findAll({
  where: {
    topic_id,
  },
  raw: true,
});

// todo: find a way to remove hardcoding of firewall tags
const firewallTags = ['firewall_know', 'firewall_think', 'firewall_play', 'firewall_reflect'];
export const getFirewallResourceCount = getResourceCountByTags.bind(null, firewallTags);

export const autoTagUrls = (url) => request
  .post(autotag_url, { url })
  .then((response_data) => response_data)
  .catch(err => {
    console.error('Auto Tag failed', err);
    return { message: 'Error. Invalid response from autotag url' };
  });

export const createResource = (url, level, owner, tagged, title = '',
  description = '', source = 'slack', type = 'article', details = {},
  thumbnail = '', program = 'tep') => Resource.create(
  {
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
    thumbnail,
  },
);


export const createFromSlackAttachment = async (attachment, owner) => {
  const url = attachment.original_url;
  try {
    const data = await autoTagUrls(url);
    console.log(data);
    const { predicted_tag_ids } = data.body.data;
    return createResource(attachment.original_url || attachment.app_unfurl_url,
      'beginner', owner, predicted_tag_ids, attachment.title, attachment.text,
      'slack', 'article', { slack: attachment }, attachment.thumb_url, 'tep');
  } catch (err) {
    console.error(err);
    return { message: 'Failed to add url' };
  }
};

export const searchResources = text => {
  console.log(`searching for: ${text}`);
  // TODO: important: remove special chars from text
  let initialSearchText = text.split(' ');
  let textWithWords = sw.removeStopwords(initialSearchText);
  let searchtext = textWithWords.join('%');
  return db.query("SELECT * FROM resources where lower(CONCAT(title, ' ', description)) like :match;", {
    model: Resource,
    replacements: { match: `%${searchtext}%` },
  });
};
