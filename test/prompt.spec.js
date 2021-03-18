const app = require('../src/server');
const request = require('supertest');
const expect = require('chai').expect;


describe('PROMPT ROUTES', () => {
  it('GET /api/prompts should fetch all the prompts from the database', done => {
    request(app)
    .get('/api/prompts')
    .expect(200)
    .end( (err) => {
      if (err) throw err;
      done();
    });
  });

  it('GET /api/prompts should fetch all prompts in JSON format', done => {
    request(app)
    .get('/api/prompts')
    .expect('Content-Type', /json/)
    .end( (err) => {
      if (err) throw err;
      done();
    });
  });

  it('GET /api/prompts/:prompts_id should fetch the prompt details', done => {
    request(app)
    .get('/api/prompts/:prompt_id')
    .expect(200)
    .expect('Content-Type', /json/)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('GET /api/prompts/:prompts_id should be JSON type', done => {
    request(app)
    .get('/api/prompts/:prompt_id')
    .expect('Content-Type', /json/)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('POST /api/prompts/:prompts_id should add prompt to the database', done => {
    request(app)
    .post('/api/prompts/:prompt_id')
    .expect(201)
    .expect('Content-Type', /json/)
    //.set('Accept', 'application/json')
    .end( (err, res) => {
      if(err) throw err;

      expect(res.body, 'Prompt should have "id" property').to.have.property('_id');
      expect(res.body, 'Prompt should have "name" property').to.have.property('name');
      expect(res.body, 'Prompt should have "duration" property').to.have.property('duration');
      expect(res.body, 'Prompt should have "type" property').to.have.property('type');
      expect(res.body, 'Prompt should have "data" property').to.have.property('data');

      expect(res.body.name, 'Prompt name should not be empty').to.not.be.empty;
      expect(res.body.name, 'Prompt name should not be null').to.not.be.null;
      
      expect(res.body.data, 'Prompt data should not be empty').to.not.be.empty;
      expect(res.body.data, 'Prompt data should not be null').to.not.be.null;

      expect(res.body.duration, 'Prompt duration should not be empty').to.not.be.empty;
      expect(res.body.duration, 'Prompt duration should not be null').to.not.be.null;

      expect(res.body.type, 'Prompt type should not be empty').to.not.be.empty;
      expect(res.body.type, 'Prompt type should not be null').to.not.be.null;

      done();
    })
  });

  it('PATCH /api/prompts/:prompt_id should update prompt in the database', done => {
    request(app)
    .patch('/api/prompts/:prompt_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

  it('DELETE /api/prompts/:prompt_id should delete prompt in the database', done => {
    request(app)
    .delete('/api/prompts/:prompt_id')
    .expect(200)
    .end( err => {
      if(err) throw err;
      done();
    })
  });

});