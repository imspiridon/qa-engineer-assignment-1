const request = require('supertest');
const expect = require('chai').expect;
const baseUrl = 'petstore.swagger.io/v2'

describe('First test', () => {
    it('Can find pet by status', (done) => {
        request(baseUrl)
            .get('/findByStatus?status=available')
            .expect(200)
            .expect('Content-Type', /json/)
            .done();
    })
});
