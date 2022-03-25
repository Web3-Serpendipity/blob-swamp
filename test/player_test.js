const { Player } = require('../player');
var assert = require('assert')
describe('A player', function (){
    it('can be created', function () {
        assert.notEqual(new Player(), undefined);
    })
    it('will have correct attribute types', function () {
        assert.equal(new Player().id, -1);
    })
    it('will have correct number of attributes', function () {
        assert.equal(Object.keys(new Player()).length, 8);
    })
    it('will have a nonce', () => {
        assert.notEqual(new Player().nonce, undefined)
    })
    it('will only have number for a nonce', () => {
        assert.equal((typeof new Player().nonce), 'number')
    })
})