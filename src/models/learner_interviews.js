import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { createPad } from "../intergrations/codeinterview/controllers"

const LearnerInterviews = db.define('learner_interviews', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        default: Sequelize.UUIDV4,
      },
      recruiter_ids: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      learner_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      job_application_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      codepad_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      codeinterview_link: {
        allowNull: false,
        type: Sequelize.STRING
      },
      interview_round: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      interview_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      interviewer_remarks: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      final_status: {
        type: Sequelize.STRING
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

const createInterview = async (interview, name="Interview - SOAL Recruitment Drive") => {
  let codepad = await createPad(name);
  return LearnerInterviews.create({
    id: uuid(),
    codepad_id: codepad.id,
    codeinterview_link: codepad.url,
    ...interview
  })
 }

 const updateInterview = (id, interview) =>
  LearnerInterviews.update({
    ...interview
  }, {
    where: {
      id
    },
    returning: true
  })

export {
  LearnerInterviews,
  createInterview,
  updateInterview
}