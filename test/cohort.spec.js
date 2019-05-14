const app = require('../server/server');
const request = require('supertest');
const expect = require('chai').expect;

describe('COHORT ROUTES', () => {
    it('GET /api/cohorts should get all cohorts', done => {
        request(app)
        .get('/api/cohorts')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done(); 
        })
    });

    it('GET /api/cohorts should get all cohorts in JSON format', done => {
        request(app)
        .get('/api/cohorts')
        .expect('Content-Type', /json/)
        .end( (err, res) => {
            if(err) throw err;
            done();
        })
    });

    it('POST /api/cohorts/:cohort_id should add cohort to the database', done => {
        request(app)
        .post('/api/cohorts/:cohort_id')
        .expect(201)
        .end( (err, res) => {
            if(err) throw err;

            expect(res.body, 'Cohort should have id property').to.have.property('_id');
            expect(res.body, 'Cohort should have name property').to.have.property('name');
            expect(res.body, 'Cohort should have endDate property').to.have.property('endDate');
            expect(res.body, 'Cohort should have startDate property').to.have.property('startDate');

            expect(res.body.startDate, 'startDate cannot be empty').to.not.be.empty;
            expect(res.body.startDate, 'startDate cannot be null').to.not.be.null;
            expect(res.body.spotters, 'Spotters should be array type').to.be.instanceof(Array);
            done();
        })
    });

    it('PATCH /api/cohorts/:cohort_id should update cohort', done => {
        request(app)
        .patch('/api/cohorts/:cohort_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('DELETE /api/cohorts/:cohort_id should delete cohort', done => {
        request(app)
        .delete('/api/cohorts/:cohort_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });
})
