const assert = require('assert');
const game = require('../game.js');

describe('Game', function() {

  beforeEach(function () {
  });

    describe('#functions()', function () {
        it('can be created', function () {
            assert.equal(typeof(game) !== 'undefined', true)
        });

        it('has an internal food array', function () {
            console.log(game)
            assert.equal(game.food, [])
        });
    });
});
