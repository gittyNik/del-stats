import uuid from 'uuid/v4';
import _ from 'lodash';
import models from '../../models';
import { setSubmitTimeNow, getUnsubmittedTestsOfApplication } from '../../models/test';
import { populateQuestionDetails } from './test_question.controller';
import { submitApplicationAndNotify } from './application.controller';
import scoreTest from './test_score.controller';

const {
  Application, Cohort, Program, Test, TestQuestion,
} = models;

export const getAllTests = (req, res) => {
  Test.findAll({ raw: true })
    .then(populateQuestionDetails)
    .then(data => res.status(200).json(data))
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

export const getTestByApplicationId = (req, res) => {
  const { id } = req.params;
  Test.findAll({ where: { application_id: id }, raw: true })
    .then(populateQuestionDetails)
    .then(populateRubrics)
    .then((testSeries) => {
      testSeries.forEach(test => {
        if (test.purpose === 'know') {
          test.mindset = scoreTest(test);
        }
      });
      res.status(200).json(testSeries);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

export const populateRubric = test => Application.findByPk(test.application_id, {
  include: [{
    model: Cohort,
    foreignKey: 'cohort_applied',
    include: [Program],
  }],
  raw: true,
}).then(application => {
  const [template] = application['cohort.program.test_series'].tests
    .filter(t => t.purpose === test.purpose);
  if (template) {
    test.rubric = template.rubric;
  }
  return test;
});
const populateRubrics = tests => Promise.all(tests.map(populateRubric));

export const getTestById = (req, res) => {
  const { id } = req.params;
  Test.findAll({ where: { id }, raw: true })
    .then(populateQuestionDetails)
    .then(populateRubrics)
    .then(tests => {
      if (tests.length > 0) {
        res.send({
          data: tests[0],
        });
      } else res.sendStatus(404);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

// TODO: if no other tests found,
// then update the application status to review_pending
export const submitTest = (req, res) => {
  const { id } = req.params;
  const { phone } = req.jwtData.user;

  // if active test, then submit, otherwise ignore
  setSubmitTimeNow(id)
    .then(test => {
      if (test) { // if test exists, submit is success
        // responds with the list of pending tests(id, purpose, duration)
        return getUnsubmittedTestsOfApplication(test.application_id)
          .then(pending_tests => {
            if (pending_tests.length === 0) {
              return submitApplicationAndNotify(test.application_id, phone);
            }
            return pending_tests;
          })
          .then(pending_tests => res.send({
            data: {
              test,
              pending_tests,
            },
          }));
      }
      res.status(409).send({
        text: 'Error: Can not submit, the test is not running',
      });
      return test;
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

// todo: submit other tests in the same application
export const startTest = (req, res) => {
  const { id } = req.params;
  Test.findByPk(id)
    .then(test => test.start())
    .then(test => test.get({ plain: true }))
    .then(test => populateQuestionDetails([test]))
    .then(testSeries => res.send(testSeries[0]))
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

export const updateTestScores = (req, res) => {
  const { scores } = req.body;
  const { id } = req.params;

  Test.update({
    scores,
    updated_at: new Date(),
  }, {
    where: { id },
    returning: true,
  })
    .then(results => results[1][0])
    .then((data) => {
      res.send({ data });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const updateTestResponses = (req, res) => {
  const { responses } = req.body;
  const { id } = req.params;

  Test.findByPk(id)
    .then((test) => {
      // applicant can't answer after submission
      if (test.sub_time) {
        const text = 'Error: Test already submitted';
        console.error(text);
        return res.status(409).send({ data: test, text });
      }

      // check for expiry
      if (test.start_time + test.duration > Date.now()) {
        return setSubmitTimeNow(id)
          .then(data => {
            const text = 'Error: Test expired, submitted now';
            console.error(text);
            res.status(410).send({ data, text });
          });
      }

      // use response sent by client or the original from db
      const finalResponses = test.responses.map(dbResponse => responses
        .find(r => r.question_id === dbResponse.question_id) || dbResponse);
      return Test.update({
        responses: finalResponses,
        updated_at: new Date(),
      }, {
        where: { id },
        returning: true,
      })
        .then(results => results[1][0])
        .then((data) => {
          res.status(201).send(data);
        });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
};

export const updateTest = updateTestResponses;

export const updateBrowsedUrl = (req, res) => {
  const { browsedUrls } = req.body;
  const history = JSON.parse(browsedUrls);
  console.log(history);
  const { id } = req.params;
  Test.update({
    browser_history: history.urls,
  }, { where: { id } })
    .then(data => res.status(201).send(data))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

// NOTE: this logic must be changed if the question count is more than 3 digits
const generateTest = (template, application, allQuestions) => {
  /*
  test_series_example:[{
    duration: 15*60*1000, // Max durations in milliseconds
    purpose: 'know', // Purpose of having this test in series
    typesAllowed: ['mcq', 'rate'],
    random: {generic: 5}, // Domains & counts of the random questions
    questions_fixed: [],  // An array of fixed questions
  }]
  */
  let testQuestions = allQuestions.filter(q => (
    template.questions_fixed && template.questions_fixed.includes(q.id)
  ));

  Object.keys(template.random).forEach(domain => {
    const randomQuestions = allQuestions.filter(q => q.domain === domain)
      .filter(q => !template.typesAllowed || template.typesAllowed.includes(q.type));
    testQuestions = _.shuffle(randomQuestions)
      .splice(0, template.random[domain]).concat(testQuestions);
  });

  const questionDetails = testQuestions.map((q) => {
    delete q.answer;
    return q;
  });

  const responses = testQuestions.map(q => ({ question_id: q.id }));

  const { purpose, duration } = template;
  return Test.create({
    id: uuid(),
    application_id: application.id,
    purpose,
    duration,
    responses,
    created_at: new Date(),
    updated_at: new Date(),
  }, { raw: true }).then((test) => {
    test.dataValues.questionDetails = questionDetails;
    return test;
  });
};

// questions[{qid,answer,isCorrect,review,reviewed_by}]
export const generateTestSeries = (template, application) => {
  template = template.tests;
  return TestQuestion.findAll({ raw: true })
    .then(allQuestions => Promise.all(template.map(testTemplate => (
      generateTest(testTemplate, application, allQuestions)
    ))))
    .then(test_series => ({
      application,
      test_series,
    }));
};

export const populateTestSeries = application => {
  let application_id = application.id;
  return Test.findAll({ where: { application_id }, raw: true })
    .then(populateQuestionDetails)
    .then(test_series => ({ application, test_series }));
};

// pending
export const updateVideo = (req, res) => {
  res.status(501).send('not implemented');
  // Test.update({
  //     questions: {}
  //   }, {
  //     where: {
  //       id: req.params.id
  //     }
  //   })
  // .then(data => res.status(201).send(data))
  // .catch(err => res.sendStatus(500))
  // UPDATE post SET questions: {} WHERE id: 2;
};
