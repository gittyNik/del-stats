const app = require('../server/server');
const request = require('supertest');
const expect = require('chai').expect;

describe('PING ROUTES', () => {
    it('GET /api/pings should get all pings from database', done => {
        request(app)
        .get('/api/pings')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('GET /api/pings should get all pings in JSON format', done => {
        request(app)
        .get('/api/pings')
        .expect('Content-Type', /json/)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('POST /api/pings/:ping_id should add ping in database', done => {
        request(app)
        .post('/api/pings/:ping_id')
        .expect(201)
        .end( (err, res) => {
            if(err) throw err;

            expect(res.body, "ping should contain 'id' property").to.have.property('_id');
            expect(res.body, "ping should contain 'data' property").to.have.property('data');
            expect(res.body, "ping should contain 'ttl' property").to.have.property('ttl');
            expect(res.body, "ping should contain 'type' property").to.have.property('type');

            expect(res.body.data, "Ping data cannot be empty").to.not.be.empty;
            expect(res.body.data, "Ping data cannot be null").to.not.be.null;

            expect(res.body.ttl, "Ping ttl cannot be empty").to.not.be.empty;
            expect(res.body.ttl, "Ping ttl cannot be null").to.not.be.null;

            expect(res.body.type, "Ping type cannot be empty").to.not.be.empty;
            expect(res.body.type, "Ping type cannot be null").to.not.be.null;
            done();
        })
    });

    it('PATCH /api/pings/:ping_id should update ping in database', done => {
        request(app)
        .patch('/api/pings/:ping_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });

    it('DELETE /api/pings/:ping_id should delete ping in database', done => {
        request(app)
        .delete('/api/pings/:ping_id')
        .expect(200)
        .end( err => {
            if(err) throw err;
            done();
        })
    });
});