const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
require('dotenv').config({
  silent: true,
}); //  optional

const nlu = new NaturalLanguageUnderstandingV1({
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api',
});

const getWatsonData = (link) => {
  const urlFormat = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;
  const urlRegex = new RegExp(urlFormat);

  return new Promise((resolve, reject) => {
    console.log('$$$$$$$$$$$$$$');
    console.log(link);
    console.log(urlRegex);

    if (link.match(urlRegex)) {
      const options = {
        url: link,
        features: {
          concepts: {},
          keywords: {
            sentiment: true,
            emotion: true,
          },
          categories: {},
          entities: {},
          metadata: {},
          relations: {},
          semantic_roles: {},
        },
      };
      nlu.analyze(options, (err, res) => {
        if (err) {
          console.log(err);
          reject();
        }
        resolve(res);
      });
    } else {
      reject(new Error('Please enter a valid URL'));
    }
  });
};

// getWatsonData("https://stackoverflow.com/questions/43099808/bash-sequelize-command-not-found").then(d => console.log(d)).catch(e => console.log(e))

// export default getWatsonData;
