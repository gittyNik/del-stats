import { getAgreementTemplate } from '../../models/agreements_template';

const getTemplateId = (req, res) => {
  let {
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
  } = req.body;
  getAgreementTemplate(
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
  )
    .then(data => {
      if (data !== null) {
        res.status(200).json({
          message: 'Template id found',
          data,
          type: 'success',
        });
      } else {
        res.status(404).json({
          message: 'Template id not found',
          type: 'failure',
        });
      }
    })
    .catch((err) => res.status(500).json({
      message: `Reason for error: ${err}`,
      type: 'failure',
    }));
};

export default getTemplateId;
