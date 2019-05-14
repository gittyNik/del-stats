const app = require('../server/server');
const request = require('supertest');
const expect = require('chai').expect;

describe('DAY ROUTES', () => {
    it('GET /api/cohorts/:cohort_id/days/:day_id should get the day data', done => {
        request(app)
        .get('/api/cohorts/:cohort_id/days/:day_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });
    
    it('GET /api/cohorts/:cohort_id/days/:day_id should get day data in JSON format', done => {
        request(app)
        .get('/api/cohorts/:cohort_id/days/:day_id')
        .expect('Content-Type', /json/)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('PATCH /api/cohorts/:cohort_id/days/:day_id should update day data', done => {
        request(app)
        .patch('/api/cohorts/:cohort_id/days/:day_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });
})