const app = require('../src/server');
const request = require('supertest');
const expect = require('chai').expect;

describe('STUDENT ROUTES', () => {
  it('GET /api/students/signup should get the signup form for student', done => {
    request(app)
    .get('/api/students/signup')
    .expect(200)
    .end( (err) => {
      if (err) throw err;
      done();
    });
  });

  it('GET /api/students/:student_id should fetch the student details', done => {
    request(app)
    .get('/api/students/:student_id')
    .expect(200)
    .expect('Content-Type', /json/)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('GET /api/students/:student_id should be JSON type', done => {
    request(app)
    .get('/api/students/:student_id')
    .expect('Content-Type', /json/)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('POST /api/students/:student_id should add student to the database', done => {
    request(app)
    .post('/api/students/:student_id')
    .expect(201)
    .set('Accept', 'application/json')
    .end( (err, res) => {

      expect(res.body, 'Student should have id property').to.have.property('_id')
      expect(res.body, 'Student should have name property').to.have.property('name');
      expect(res.body, 'Student should have role property').to.have.property('role');
      expect(res.body, 'Student should have cohorts property').to.have.property('cohorts');
      expect(res.body, 'Student should have currentCohorts property').to.have.property('currentCohorts');
      expect(res.body, 'Student should have path property').to.have.property('path');

      expect(res.body.name, "Student name cannot be empty").to.not.be.empty;
      expect(res.body.name, "Student name cannot be null").to.not.be.null;

      expect(res.body.role, "Student role cannot be empty").to.not.be.empty;
      expect(res.body.role, "Student role cannot be null").to.not.be.null;

      expect(res.body.currentCohort, "Student currentCohort property cannot be empty").to.not.be.empty;
      expect(res.body.currentCohort, "Student currentCohort property cannot be null").to.not.be.null;

      expect(res.body.cohorts, 'cohorts should be of array type').to.be.instanceof(Array);

      if(err) throw err;
      done();
    })
  });

  it('PATCH /api/students/:student_id should update student in the database', done => {
    request(app)
    .patch('/api/students/:student_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('DELETE /api/students/:student_id should delete student in the database', done => {
    request(app)
    .delete('/api/students/:student_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

});