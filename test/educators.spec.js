const app = require('../server/server');
const request = require('supertest');
const expect = require('chai').expect;


describe('EDUCATOR ROUTES', () => {
  it('GET /api/educators should fetch all the educators from the database', done => {
    request(app)
    .get('/api/educators')
    .expect(200)
    .end( (err) => {
      if (err) throw err;
      done();
    });
  });

  it('GET /api/educators should fetch all educators in JSON format', done => {
    request(app)
    .get('/api/educators')
    .expect('Content-Type', /json/)
    .end( (err) => {
      if (err) throw err;
      done();
    });
  });

  it('GET /api/educators/:educator_id should fetch the educator details', done => {
    request(app)
    .get('/api/educators/:educator_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('GET /api/educators/:educator_id should be JSON type', done => {
    request(app)
    .get('/api/educators/:educator_id')
    .expect('Content-Type', /json/)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('POST /api/educators/:educator_id should add an educator to the database', done => {
    request(app)
    .post('/api/educators/:educator_id')
    .expect(201)
    .expect('Content-Type', /json/)
    .set('Accept', 'application/json')
    .end( (err, res) => {

      expect(res.body, 'Educator should have id property').to.have.property('_id')
      expect(res.body, 'Educator should have name property').to.have.property('name');
      expect(res.body, 'Educator should have role property').to.have.property('role');

      expect(res.body.name, "Educator name cannot be empty").to.not.be.empty;
      expect(res.body.name, "Educator name cannot be null").to.not.be.null;

      expect(res.body.role, "Educator role cannot be empty").to.not.be.empty;
      expect(res.body.role, "Educator role cannot be null").to.not.be.null;
      if(err) throw err;
      done();
    })
  });

  it('PATCH /api/educators/:educator_id should update an educator in the database', done => {
    request(app)
    .patch('/api/educators/:educator_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('DELETE /api/educators/:educator_id should delete an educator in the database', done => {
    request(app)
    .delete('/api/educators/:educator_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

});