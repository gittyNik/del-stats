const getScore = (option, questionIndex)=>{
  var knowscores = [0,0,1,1, 1,0,1,0, 1,1,0,0,  0,1,1,0,   0,1,1,0];
  var positiveScore = {
    'Strongly Disagree': 0,
    'Disagree': 1,
    'Agree': 2,
    'Strongly Agree': 3,
  }
  var negativeScore = {
    'Strongly Disagree': 3,
    'Disagree': 2,
    'Agree': 1,
    'Strongly Agree': 0,
  }
  var score = knowscores[questionIndex] ? positiveScore: negativeScore;
  return score[option]
}

const scoreTest = test => {
  const MAX_SCORE = 60;
  const OPTIONS = ['Highly fixed', 'Fixed', 'Growth', 'Highly growth'];
  let score = 0;
  if(test.purpose === 'know') {
    score = test.responses.map(r=>{
      return r.answer? r.answer.answer.option : r;
    }).map(getScore).reduce((a,e)=>(a+e), 0);
    score = OPTIONS[Math.floor((OPTIONS.length*score)/MAX_SCORE)];
  }

  return score;
}

export default scoreTest;