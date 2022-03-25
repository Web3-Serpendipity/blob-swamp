var insert = require('../insert')

describe('testing insert array functionality', function () {
    it('should not be undefined', function () {
        return (insert.insert([0,1], 3) !== undefined);
    })
    
    it('should have three elements', function () {
        return (insert.insert([0,1], 3).lenghth == 3);
    })

    it('should fill in holes', function () {
        return (insert.insert([0,1,undefined, 4], 3) == [0,1,2,4]);
    })
})
