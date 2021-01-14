import { getApplicantPlans, addPaymentDetails } from '../../models/payment_details';
import { addPaymentIntervals } from '../../models/payment_intervals';

const getApplicantPlansEndpoint = (req, res) => {
  const { id: applicant_id } = req.params;
  getApplicantPlans(applicant_id).then(data => res.send({
    type: 'success',
    data,
    message: 'Fetched applicant plans',
  })).catch(err => res.status(500).send({
    type: 'failure',
    data: {
      Error: err,
    },
  }));
};

const addPaymentDetailsEndpoint = (req, res) => {
  const { details } = req.body;
  let id = null;
  if (req.body.id) {
    id = req.body.id;
  }
  addPaymentDetails(details, id)
    .then(data => res.send({
      type: 'success',
      data,
    }))
    .catch(err => {
      console.log(err);
      res.status(500).send({
        type: 'failure',
        data: {
          Error: err,
        },
      });
    });
};

const addPaymentIntervalsEndpoint = (req, res) => {
  const { intervals } = req.body;
  let id = null;
  if (req.body.id) {
    id = req.body.id;
  }
  addPaymentIntervals(intervals, id)
    .then(data => res.send({
      type: 'success',
      data,
    }))
    .catch(err => res.status(500).send({
      type: 'failure',
      data: {
        Error: err,
      },
    }));
};

export {
  getApplicantPlansEndpoint,
  addPaymentDetailsEndpoint,
  addPaymentIntervalsEndpoint,
};
