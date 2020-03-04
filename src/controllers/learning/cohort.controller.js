import {
  Cohort, getFutureCohorts, getCohortLearnerDetails,
  getCohortLearnerDetailsByName, beginCohortWithId,
  getCohortFromLearnerId
} from '../../models/cohort';
import { createBreakoutsInMilestone, BreakoutTemplate, getReleaseTimeFromTopic, updateBreakoutTemplates } from '../../models/breakout_template';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  getCohortLearnerDetailsByName({ name, location, year })
    .then((cohorts) => {
      res.json({ cohorts });
    }).catch((e) => {
      console.error(e);
      res.sendStatus(404);
    });
};

export const getCohort = (req, res) => {
  getCohortLearnerDetails(req.params.id)
    .then((cohort) => {
      res.json({ cohort });
    })
    .catch(() => res.sendStatus(404));
};

export const createCohort = (req, res) => {
  let {
    name, location, program, start_date,
  } = req.body;
  start_date = new Date(+start_date);
  Cohort.create({
    name, location, program, start_date,
  })
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch(err => res.status(500).send({ err }));
};

export const updateCohort = (req, res) => {
  const { location, program, start_date } = req.body;
  const { id } = req.params;
  Cohort.update({ location, program, start_date }, { where: { id } })
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteCohort = (req, res) => {
  const { id } = req.params;
  Cohort.destroy({ where: { id } })
    .then(() => res.status(204))
    .catch(err => res.status(500).send(err));
};

export const getUpcomingCohorts = (req, res) => {
  getFutureCohorts()
    .then((data) => {
      res.send({ data });
    })
    .catch(() => res.sendStatus(404));
};

export const beginCohort = (req, res) => {
  const { id } = req.params;

  beginCohortWithId(id)
    .then(cohort => {
      res.send(cohort);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    });

  // add cohort.learners
  // update cohort_joining on firewall_application
  // notify learning_ops_manager
  // schedule beginMilestone
};

export const beginMilestone = () => {
  // update cohort_milestone.learners from cohort
};
// create cohort_milestones
// create teams for each milestone

export const getCohortByLearnerId = (req, res) => {
  const {
    id
  } = req.params;

  getCohortFromLearnerId(id)
    .then(cohort => {
      res.send({
        text: "Cohort Details",
        data: cohort
      })
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    })
};

export const funTesting = async (req, res) => {
  let topic_id = '15df135c-92ca-4d82-8c41-079854cc43ca'; // filesystem traversal
  let cohort_id = '05bb9432-f5b6-4b92-aa7f-7325abedde0e'; // Centaurus
  let breakoutTemplates = [
    {
      id: 'b519a3e1-3821-49c9-992d-613a58fb1f31',
      topic_id:
        ['f9fe219a-7dab-4c59-944f-9f70bbd070dd',
          '15df135c-92ca-4d82-8c41-079854cc43ca',
          'd7da19fe-509b-44dc-acb0-186503cbc158',
          '9c161e2e-7938-4484-b102-e5bcfd06fbc7'],
      duration: 60,
      time_scheduled: '12:00:00',
      after_days: 1,
    },
    {
      id: '57b9f110-5c20-4dc5-a534-f74aabb6b8ee',
      topic_id:
        ['0c08f370-68e9-4887-841a-d50a5f70a67b',
          'da09bf99-15d3-4e30-b927-73ea9ac3b103',
          '3bbb6992-feb2-4ff2-814c-3e1cda376333'],
      duration: 60,
      time_scheduled: '15:00:00',
      after_days: 1,
    },
  ];

  let updatedlist = await updateBreakoutTemplates(breakoutTemplates, cohort_id);
  console.log(updatedlist);
  res.send(updatedlist);
  // createBreakoutsInMilestone(cohort_id)
  //   .then(data => {
  //     res.send(data);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.sendStatus(500);
  //   });
  // console.log('RESPONSE: ', response2);
  // res.send(typeof response2);
};
