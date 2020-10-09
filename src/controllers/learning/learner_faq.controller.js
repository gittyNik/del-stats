import {
  getLearnerFaqById,
  getAllLearnerFaqs,
  createLearnerFaq,
  updateLearnerFaq,
  deletelearnerFaq,
  toggleHelpfulLearnerFaq,
  toggleUnhelpfulLearnerFaq,
} from '../../models/learner_faq';
import { logger } from '../../util/logger';

export const getALearnerFaq = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const learnerFaq = await getLearnerFaqById(id);
    res.status(200).json({
      text: 'A Learner Faq',
      data: learnerFaq,
      type: 'success',
    });
  } catch (err) {
    logger.error(err);
    console.error(err);
    res.status(500).json({
      type: 'failure',
      err,
    });
  }
};

export const getAllFaqs = async (req, res) => {
  try {
    const learnerFaqs = await getAllLearnerFaqs();
    res.status(200).json({
      text: 'All Learner Faqs',
      data: learnerFaqs,
      type: 'success',
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      type: 'failure',
      err,
    });
  }
};

export const createAlearnerFaq = async (req, res) => {
  const { program_id, title, body, topics } = req.body;
  const user_id = req.jwtData.user.id;
  try {
    const learnerFaq = await createLearnerFaq({
      program_id, title, body, user_id, topics
    });
    res.status(201).json({
      text: 'Successfully created a learnerFaq',
      data: learnerFaq,
      type: 'success',
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      type: 'failure',
      err,
    });
  }
};

export const updateAlearnerFaq = async (req, res) => {
  const { program_id, title, body, topics } = req.body;
  const { id } = req.params;
  const user_id = req.jwtData.user.id;
  try {
    const updatedLearnerFaq = await updateLearnerFaq({
      learner_faq_id: id,
      program_id,
      title,
      body,
      topics,
      user_id,
    });
    res.status(200).json({
      text: 'Updated LearnerFaq successfully',
      data: updatedLearnerFaq,
      type: 'success',
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      type: 'failure',
      err,
    });
  }
};

export const deleteAlearnerFaq = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteRes = await deletelearnerFaq(id);
    res.status(200).json({
      text: 'Deleted a learner faq',
      type: 'success',
      data: deleteRes,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      type: 'failure',
      err,
    });
  }
};

export const toggleHelpful = async (req, res) => {
  const { id } = req.params;
  const user_id = req.jwtData.user.id;
  try {
    const updatedLearnerFaq = await toggleHelpfulLearnerFaq({
      learner_faq_id: id,
      user_id,
    });
    res.status(200).json({
      text: 'Toggled helpful count in learnerFaq',
      data: updatedLearnerFaq,
      type: 'success',
    });
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
};

export const toggleUnhelpful = async (req, res) => {
  let { id } = req.params;
  const user_id = req.jwtData.user.id;
  try {
    const updatedLearnerFaq = await toggleUnhelpfulLearnerFaq({
      learner_faq_id: id,
      user_id,
    });
    res.status(200).json({
      text: 'Toggled unhelpful count in learnerFaq',
      data: updatedLearnerFaq,
    });
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
};
