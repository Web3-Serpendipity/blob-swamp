const { Player } = require('../player');
var assert = require('assert')
describe('A player', function (){
    it('can be created', function () {
        if (Player() == undefined ) {
            return false; // test fails
        } else {
            return true;
        }
    });
    it('will have correct attribute types', function () {
        if (new Player().id == undefined ) {
            return false; // test fails
        } else {
            return true;
        }
    })
})