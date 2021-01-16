import {
  getAgreementTemplate,
  createAgreementTemplates,
  updateAgreementTemplates,
  deleteAgreementTemplate,
} from '../../models/agreements_template';
import {
  getApplicationStage,
} from '../../models/application';
import {
  getCohortFromId,
} from '../../models/cohort';

export const getApplicationDetails = async (id) => {
  let applicationDetails = await getApplicationStage(id);
  
  let { cohort_applied } = applicationDetails;

  let cohortDetails = await getCohortFromId(cohort_applied);

  return getAgreementTemplate(
    {
      program: cohortDetails.program_id,
      cohort_duration: cohortDetails.duration,
      is_isa: applicationDetails.is_isa,
      is_job_guarantee: applicationDetails.is_job_guarantee,
      payment_type: applicationDetails.payment_type,
    },
  );
};

export const getTemplateId = async (req, res) => {
  const { id } = req.jwtData.user;

  getApplicationDetails(id).then(data => {
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
    document_identifier,
  } = req.body;
  const updated_by = req.jwtData.user.id;

  createAgreementTemplates(
    {
      program,
      cohort_duration,
      is_isa,
      is_job_guarantee,
      payment_type,
      payment_details,
      updated_user: updated_by,
      document_identifier,
    },
  ).then((data) => { res.json(data); })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const updateAgreementTemplatesAPI = (req, res) => {
  const {
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
    document_identifier,
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
    document_identifier,
  ).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteAgreementTemplateAPI = (req, res) => {
  const { id } = req.params;

  deleteAgreementTemplate(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
