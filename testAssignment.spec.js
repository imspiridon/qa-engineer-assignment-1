const request = require('supertest')('https://petstore.swagger.io/v2');
const chai = require('chai'), expect = chai.expect;

describe('Swagger petsore API test automation assignment', () => {
    it('Can search pets by status "available"', async () => {
        // Test cases covered: TC-API-001
        // Verifies that searching pets by status 'available' returns correct status code and it is not empty
        
        // Perform GET request
        const findByStatus = await request
            .get('/pet/findByStatus?status=available');

        // Assert that status code is 200
        expect(findByStatus.status).to.equal(200);
        // Assert that response is not empty and has the main properties
        expect(findByStatus.body).to.be.not.empty;
        expect(findByStatus.body[0]).to.have.property("id");
        expect(findByStatus.body[0]).to.have.property("name");
        expect(findByStatus.body[0]).to.have.property("tags");
    });

    it('Can add new pet to store and search new pet by its pet id', async () => {
        // Test cases covered: TC-API-002, TC-API-003
        // Verifies that is is possible ot add a new pet and search it by its id

        // Get timestamp to generate unique pet ID
        const newPetId = new Date().valueOf();
        
        // Perform POST request to crete pet with name "pupo" and category name "pajaro"
        const addNewPet = await request
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
            expect(addNewPet.status).to.equal(200);
           
            // Assert that the newly created pet has been successfully added (search by newPetId)
            const getPet = await request
                .get(`/pet/${newPetId}`)
            expect(getPet.status).to.equal(200);
            expect(getPet.body).to.have.property('id').equals(newPetId);
            expect(getPet.body).to.have.property('name').equals('pupo');
    });

    it('Can find available pet "Pupo" with category name “pajaro” and place order', async () => {
        // Test cases covered: TC-API-001, TC-API-005 
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
        
        // Use function above and pass attributes for pet name and category name to get array of matching pets
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
            // Expect status 200
            expect(placeOrder.status).to.equal(200);
            
            // Assign order ID to variable to check that order exists
            const orderId = placeOrder.body['id']
            
            // console.log(orderId);
            // New get request to check the order by ID
            const checkOrderById = await request
                .get(`/store/order/${orderId}`);
            
            // Assert that order object contains the right pet id
            expect(checkOrderById.body).to.have.property('petId').equals(returnedPets[0]['id']);
    });

    it('Store owner can update the pet information of pets named “kurikuri” under category “pomeranian” to add the tag “Super Cute”', async () => {
        // Test cases covered: TC-API-003, TC-API-004, TC-API-006 

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
            .put('/pet/')
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
        
        // Get id of updated pet
        const updatedPetId = updatePet.body['id'];
        // console.log(updatedPetId);

        // Find pets with tag "Super Cute"
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
