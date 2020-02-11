import { apiNotReady } from '../api.controller';
import { User } from '../../models/user';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';
import { createDeal, associateDealWithContact } from '../../integrations/hubspot/controllers/deals.controller';

export const getProfile = (req, res) => {
  res.json({ user: req.jwtData.user });
};

export const updateUser = apiNotReady;

export const updateProfile = (req, res) => {
  const { id, phone } = req.jwtData.user;
  const {
    email, firstName, lastName, name, location, profile, hubspot
  } = req.body;
  const { gender, birthDate } = profile;
  const { knowAboutSOALFrom, occupationBeforeSOAL, whichCohort, program } = hubspot;
  createOrUpdateContact({
    email, 
    phone,
    firstName, 
    lastName, 
    location,
    gender,
    knowAboutSOALFrom,
    occupationBeforeSOAL,
    birthDate,
    whichCohort,
    program
  }).then(result => {
    createDeal({
      name,
      email,
      phone
    })
    .then(deal => { 
      const dealId = deal.dealId;
      const contactId = result.vid;
      associateDealWithContact(dealId, contactId)
      .then(() => {
        profile.hubspotDealId = dealId;
        User.update({
          email, name, location, profile,
        }, {
          where: { id },
          returning: true,
          raw: true,
        })
          .then(result => result[1][0])
          .then(data => {
            res.send({
              data,
              text: 'Update success',
            });
          })
          .catch(err => {
            console.error(err);
            res.sendStatus(500);
          });
      })
    })
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  })
};
