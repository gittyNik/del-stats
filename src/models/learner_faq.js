import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';

export const LearnerFaq = db.define('learner_faqs', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  program_id: {
    type: Sequelize.STRING,
    references: { model: 'programs', key: 'id' },
  },
  topic: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'general',
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  body: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  helpful: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
    ),
    defaultValue: [],
  },
  unhelpful: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
    ),
    defaultValue: [],
  },
  comments: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  updated_by: {
    type: Sequelize.ARRAY({
      type: Sequelize.UUID,
      references: { model: 'users' },
    }),
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

export const getLearnerFaqById = (id) => LearnerFaq.findOne({
  where: {
    id,
  },
  raw: true,
});

export const getAllLearnerFaqs = () => LearnerFaq.findAll({ raw: true });

export const createLearnerFaq = ({
  program_id, title, body, user_id,
}) => LearnerFaq.create({
  id: uuid(),
  program_id,
  title,
  body,
  updated_by: [user_id],
});

export const updateLearnerFaq = ({
  learner_faq_id, program_id, title, body, user_id
}) => LearnerFaq.update({
  program_id,
  title,
  body,
  updated_by: Sequelize.fn('array_append', Sequelize.col('updated_by'), user_id),
  updated_at: Sequelize.literal('NOW()'),
}, {
  where: { id: learner_faq_id },
  returning: true,
  raw: true,
}).then(data => data[1][0]);

export const deletelearnerFaq = async (id) => LearnerFaq.destroy({ where: { id } });

export const toggleHelpfulLearnerFaq = async ({ learner_faq_id, user_id }) => {
  const learnerFaq = await getLearnerFaqById(learner_faq_id);

  const updatedLearnerFaq = await LearnerFaq.update(
    {
      helpful: (learnerFaq.helpful.includes(user_id)) ? Sequelize.fn('array_remove', Sequelize.col('helpful'), user_id) : Sequelize.fn('array_append', Sequelize.col('helpful'), user_id),
    },
    {
      where: { id: learner_faq_id },
      returning: true,
      raw: true,
    },
  );
  return updatedLearnerFaq[1][0];
};

export const toggleUnhelpfulLearnerFaq = async ({ learner_faq_id, user_id }) => {
  const learnerFaq = await getLearnerFaqById(learner_faq_id);

  const updatedLearnerFaq = await LearnerFaq.update(
    {
      unhelpful: (learnerFaq.unhelpful.includes(user_id)) ? Sequelize.fn('array_remove', Sequelize.col('unhelpful'), user_id) : Sequelize.fn('array_append', Sequelize.col('unhelpful'), user_id),
    },
    {
      where: { id: learner_faq_id },
      returning: true,
      raw: true,
    },
  );
  return updatedLearnerFaq[1][0];
};
