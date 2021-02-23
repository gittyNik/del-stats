const app = require('../src/server');
const request = require('supertest');
const expect = require('chai').expect;

describe('PINGPONG ROUTES', () => {
    it('GET /api/pingpongs should get all ping pongs', done => {
        request(app)
        .get('/api/pingpongs')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('GET /api/pingpongs should get all ping pongs in JSON format', done => {
        request(app)
        .get('/api/pingpongs')
        .expect('Content-Type', /json/)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('POST /api/pingpongs/:pingpong_id should add pingpong to the database', done => {
        request(app)
        .post('/api/pingpongs/:pingpong_id')
        .expect(201)
        .end( (err, res) => {
            if(err) throw err;

            expect(res.body, "Pingpong should contain 'id' property").to.have.property('_id');
            expect(res.body, "Pingpong should contain 'ping' property").to.have.property('ping');

            expect(res.body.ping, "Student ping cannot be empty").to.not.be.empty;
            expect(res.body.ping, "Student ping cannot be null").to.not.be.null;

            done();
        })
    });

    it('PATCH /api/pingpongs/:pingpong_id should update pingpong', done => {
        request(app)
        .patch('/api/pingpongs/:pingpong_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });
})