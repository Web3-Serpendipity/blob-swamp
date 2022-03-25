const { Player } = require('../player');
var assert = require('assert')
describe('A player', function (){
    it('can be created', function () {
        return (Player() == undefined );
    });
    it('will have correct attribute types', function () {
        return (new Player().id == undefined);
    })
})