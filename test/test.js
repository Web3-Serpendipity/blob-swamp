var insert = require('../insert')

describe('basic tests', function () {
    it('should not be undefined', function () {
        if (insert.insert([0,1], 3) !== undefined){
            return true;
        } else {
            return false;
        }
    })
})
