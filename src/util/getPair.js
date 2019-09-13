const getStudentPair = (day, studentID) => {
  const pair = day.pairs.find(pair => pair.students.indexOf(studentID) > -1);
  let pairStudent;
  // console.log(pair)

  pair.students.length > 1 ?
    pairStudent = pair.students[0] === studentID ? pair.students[1] : pair.students[0] :
    pairStudent = pair.students[0];
  // console.log(pairStudent)
  return pairStudent;
};

export default getStudentPair;
