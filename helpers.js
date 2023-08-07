// Function to check if pets with certain pet name and category name exist in response body, if exists, it returns an array with matching pets
// if there are no matching pets, it returns an error
const findPetsByNameAndCategoryName = function (response, name, categoryName) {
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

