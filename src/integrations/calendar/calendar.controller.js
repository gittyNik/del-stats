import { listEvents, createEvents } from './calendar.model';

export const getAllCalendarEvents = (req, res) => {
    // get oauth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: req.session.user.accessToken
    });

    // get calendar events by passing oauth2 client
    listEvents(oauth2Client, (events) => {  
        console.log(events);
                
        const data = {
            name: req.session.user.name,
            displayPicture: req.session.user.displayPicture,
            id: req.session.user.id,
            email: req.session.user.email,
            events: events
        }
        res.send(data);
    });
};


export const createCalendarEvent = (req, res) => {
    // get oauth2 client
    const oauth2Client = new google.auth.OAuth2();
    const event_details = req.body.event;
    oauth2Client.setCredentials({
        access_token: req.session.user.accessToken
    });

    // create calendar events by passing oauth2 client
    createEvents(oauth2Client, event_details, (event_link) => {  
                
        const data = {
            name: req.session.user.name,
            displayPicture: req.session.user.displayPicture,
            id: req.session.user.id,
            email: req.session.user.email,
            event_link: event_link
        }
        res.send(data);
    });
};


export const scheduleCalendarEventForLearner = (req, res) => {
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2();
  const user_id = req.body.user_id;
  oauth2Client.setCredentials({
      access_token: req.session.user.accessToken
  });

  // create calendar events by passing oauth2 client
  scheduleLearnerBreakoutEvents(oauth2Client, user_id, (events) => {  
              
      const data = {
          name: req.session.user.name,
          displayPicture: req.session.user.displayPicture,
          id: req.session.user.id,
          email: req.session.user.email,
          events: events
      }
      res.send(data);
  });
};

