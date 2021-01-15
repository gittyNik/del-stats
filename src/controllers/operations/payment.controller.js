import { getApplicantPlans, addPaymentDetails } from '../../models/payment_details';
import { addPaymentIntervals } from '../../models/payment_intervals';

export const getApplicantPlansEndpoint = (req, res) => {
  const { id: applicant_id, type } = req.params;
  getApplicantPlans(applicant_id, type).then(data => res.send({
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

export const addPaymentDetailsEndpoint = (req, res) => {
  let id = null;
  if (req.body.id) {
    id = req.body.id;
  }
  addPaymentDetails(req.body, id)
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

export const addPaymentIntervalsEndpoint = (req, res) => {
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
