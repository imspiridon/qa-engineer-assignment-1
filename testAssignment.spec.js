const request = require('supertest')('https://petstore.swagger.io/v2');
const chai = require('chai'), expect = chai.expect, assert = chai.assert;
chai.use(require('chai-like'));
chai.use(require('chai-things'));

describe('First test', () => {
    it('/GET Can search pets by status', async () => {
        // Verifies that searching pets by status 'available' returns correct status code and it is not empty
        
        // Perform GET request
        const response = await request
            .get('/pet/findByStatus?status=available');

        // Assert that status code is 200
        expect(response.status).to.equal(200);
        // Assert that response is not empty
        expect(response.body).to.be.not.empty;
    });
        
    it('/GET Can find pets by ID', async () => {
        // Verifies that searching pets by ID returns correct results (checks response properties: name, category name, first tag name)
        // Assign existing pet IT to variable
        const petId = 101;

        // Perform GET request
        const response = await request
            .get(`/pet/${petId}`);
        
        // Assert that status is 200
        expect(response.status).to.equal(200);
        // Assert that response body contains an object with name 'doggie'
        expect(response.body).to.have.property('name').equals('doggie');
        // Assert that response body contains an object with category name 'sheru'
        expect(response.body).to.have.nested.property('category.name').equals('sheru');
    });

    it('/POST Can add new pet to store', async () => {
        // Get timestamp to generate unique pet ID
        const newPetId = new Date().valueOf();
        
        // Perform POST request
        const response = await request
            .post('/pet/')
            .send({
                "id": newPetId,
                "category": {
                  "name": "pajaro"
                },
                "name": "pupo",
                "status": "available"
            });
            
            // Assert that response has status '200' 
            expect(response.status).to.equal(200);
           
            // Assert that the newly created pet exists (search by newPetId)
            const getResponse = await request
                .get(`/pet/${newPetId}`)
            expect(getResponse.status).to.equal(200);
            expect(getResponse.body).to.have.property('id').equals(newPetId);
    });

    it('/ GET /POST /PUT Can find available pet "Pupo" with category name “pajaro” and place order', async () => {
        // Exercise from minimum requirements, find available pets with name "pupo" and category name "pajaro" and place order for it
        // Perform GET request for available pets
        const response = await request
            .get('/pet/findByStatus?status=available');

        // Assert that status is 200
        expect(response.status).to.equal(200);
        
        // Declare function to check if pets with certain pet name and category name exist, if exists, it returns an array with matching pets
        // if there are no matching pets, it returns an error
        const findPetsByNameAndCategoryName = function (name, categoryName) {
            pets = []
            for (let i = 0; i < response.body.length; i++) {
                if (response.body[i]['name'] == name && response.body[i]['category']['name'] == categoryName) {
                    pets.push(response.body[i])
                }
                else {
                    continue
                }
            }
            if (pets.length < 1) {
                throw new Error(`No pets found with the name "${name}" and category name "${categoryName}"`)
            }
            else {
                return pets;
            }
            
        };
        
        // Use function above and pass attributes for pet name and category name
        const returnedPets = findPetsByNameAndCategoryName('pupo', 'pajaro');

        // Send POST request with order details for the first pet with the name 'pupo' and catagory name 'pajaro'
        const placeOrder = await request
            .post('/store/order')
            .send({
                "id": 0,
                "petId": returnedPets[0]['id'],
                "quantity": 1,
                "shipDate": new Date().toISOString(),
                "status": "placed",
                "complete": true
            });
            expect(placeOrder.status).to.equal(200);
            
            // Assign order ID to variable to check that order exists
            const orderId = placeOrder.body['id']
            
            console.log(orderId);
            // New get request to check the order by ID
            const checkOrderById = await request
                .get(`/store/order/${orderId}`);
            
            // Assert that order object contains the right pet id
            expect(checkOrderById.body).to.have.property('petId').equals(returnedPets[0]['id']);
    });

    it.only('Store owner can update the pet information of pets named “kurikuri” under category “pomeranian” to add the tag “Super Cute”', async () => {
        // Create new pet named “kurikuri” under category “Pomeranian”
        const newPetId = new Date().valueOf();
        const newPet = await request
            .post('/pet/')
            .send({
                "id": newPetId,
                "category": {
                "name": "pomeranian"
                },
                "name": "kurikuri",
                "status": "available"
        });
        
        // Assert response returns status 200
        expect(newPet.status).to.be.equal(200);

        // PUT request to update the pet named “kurikuri” under category “pomeranian” to add the tag “Super Cute”
        const updatePet = await request
            .put(/pet/)
            .send({
                "id": 0,
                "category": {
                  "id": 0,
                  "name": "pomeranian"
                },
                "name": "kurikuri",
                "photoUrls": [
                  "string"
                ],
                "tags": [
                  {
                    "id": 0,
                    "name": "Super Cute"
                  }
                ],
                "status": "available" 
            });
        // Assert response returns status 200
        expect(updatePet.status).to.be.equal(200);
        const updatedPetId = updatePet.body['id'];
        console.log(updatedPetId);

        // Find pets by tag "Super Cute"
        const findPetByTags = await request
            .get('/pet/findByTags?tags=Super Cute')
        
        // Assert response returns status 200
        expect(findPetByTags.status).to.be.equal(200);
        
        // Loop through the objects of findPetByTags to find one that was updated using updatedPetId
        const petUpdated = function () {
            var isPetUpdated = false;
            for (let i = 0; i < findPetByTags.body.length; i++) {
                if (findPetByTags.body[i]['id'] == updatedPetId) {
                    // console.log('Found pet id: ' + findPetByTags.body[i])
                    isPetUpdated = true;
                    return isPetUpdated;
                }
                else {
                    // console.log('Cannot find pet id: ' + findPetByTags.body[i])
                    isPetUpdated = false;
                };
            };
            return isPetUpdated;
        }();

        // Assert that function petUpdated returns true
        expect(petUpdated).to.be.true;

    });
});
