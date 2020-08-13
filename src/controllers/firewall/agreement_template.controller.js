import getAgreementTemplate from '../../models/agreements_template';

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
    .then(data => res.status(200).json({
      message: 'Template id found',
      data,
      type: 'success',
    }))
    .catch((err) => res.status(500).json({
      message: `Reason for error: ${err}`,
      type: 'failure',
    }));
};

export default getTemplateId;
