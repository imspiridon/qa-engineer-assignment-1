const { BigInteger } = require('bignumber');
const request = require('supertest')('https://petstore.swagger.io/v2');
const expect = require('chai').expect;

describe('First test', () => {
    it('/GET Can find pets by status', async () => {
        // Verifies that searching pets by status returns correct status code and is not empty
        const response = await request
            .get('/pet/findByStatus?status=available');

        expect(response.status).to.equal(200);
        expect(response.body).to.be.not.empty;
            })
        
    it('/GET Can find pets by ID', async () => {
        // Verifies that searching pets by ID returns correct results (checks response properties: name, category name, first tag name)
        const petId = 101;
        const response = await request
            .get(`/pet/${petId}`);
        
        expect(response.body).to.have.property('name').equals('doggie');
        expect(response.body).to.have.nested.property('category.name').equals('sheru');
        expect(response.body).to.have.nested.property('tags[0].name').equals('sheru');
    })
});

