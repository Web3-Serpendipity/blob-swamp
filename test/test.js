var insert = require('../insert')

describe('testing insert array functionality', function () {
    it('should not be undefined', function () {
        if (insert.insert([0,1], 3) !== undefined){
            return true;
        } else {
            return false;
        }
    })
    
    it('should have three elements', function () {
        if (insert.insert([0,1], 3).lenghth == 3){
            return true;
        } else {
            return false;
        }
    })

    it('should fill in holes', function () {
        if (insert.insert([0,1,undefined, 4], 3) == [0,1,2,4]){
            return true;
        } else {
            return false;
        }
    })
})
