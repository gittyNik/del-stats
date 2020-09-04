import {
  getAgreementTemplate,
  createAgreementTemplates,
  updateAgreementTemplates,
  deleteAgreementTemplate,
} from '../../models/agreements_template';

export const getTemplateId = (req, res) => {
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

export const createAgreementTemplatesAPI = (req, res) => {
  const {
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
  } = req.body;
  const updated_by = req.jwtData.user.id;

  createAgreementTemplates(
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
    updated_by,
  ).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateAgreementTemplatesAPI = (req, res) => {
  const {
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
  } = req.body;
  const { id } = req.params;
  const updated_by = req.jwtData.user.id;

  updateAgreementTemplates(
    id, program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
    updated_by,
  ).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteAgreementTemplateAPI = (req, res) => {
  const { id } = req.params;

  deleteAgreementTemplate(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
