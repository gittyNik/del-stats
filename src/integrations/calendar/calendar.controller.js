const { google } = require('googleapis');


export const listEvents = function (auth, cb) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        cb(events)
      } else {
        console.log('No upcoming events found.');
      }
    });
}

// var event = {
//     'summary': 'Sample Event',
//     'location': 'School of Accelerated learning',
//     'description': 'A sample event.',
//     'start': {
//       'dateTime': (new Date()).toISOString(),
//       'timeZone': 'Asia/Kolkata',
//     },
//     'end': {
//       'dateTime': (new Date()).toISOString(),
//       'timeZone': 'Asia/Kolkata',
//     },
//     'recurrence': [
//       'RRULE:FREQ=DAILY;COUNT=2'
//     ],
//     'attendees': [
//       {'email': 'vaulstein@soal.io'},
//       {'email': 'hello@soal.io'},
//     ],
//     'reminders': {
//       'useDefault': false,
//       'overrides': [
//         {'method': 'email', 'minutes': 24 * 60},
//         {'method': 'popup', 'minutes': 10},
//       ],
//     },
// };

export const eventCreator = (summary, start=null, end=null, recurrence, attendees, 
    reminders, location='School of Accelerated learning', description='') => {
    if (start == null){
        start = (new Date()).toISOString()
    }
    if (end == null){
        var d = new Date(); d.setMinutes(d.getMinutes() + 30);
        end = d.toISOString()
    }
    if (reminders == null){
        reminders = {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10},
            ],
          }
    }
    var event = {
        'summary': summary,
        'location': location,
        'description': description,
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Kolkata',
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Kolkata',
        },
        'recurrence': recurrence,
        'attendees': attendees,
        'reminders': reminders,
    };
    return event
};

export const CreateEvents = function (auth, event_details, cb) {
    const calendar = google.calendar({version: 'v3', auth});
    const {summary, location, description, start, end, recurrence, attendees, reminders} = event_details;
    const calendar_event = eventCreator(summary, start, end, recurrence, attendees, reminders, location, description);
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: calendar_event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        cb(event.htmlLink);
      });
}

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
    CreateEvents(oauth2Client, event_details, (event_link) => {  
                
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
