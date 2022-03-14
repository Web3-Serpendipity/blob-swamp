var request = require('request');
var expect = require('chai').expect

it('Main page content', function(done) {
    request('http://localhost:8080' , function(error, response, body) {
        expect(body).to.equal('Blob Wars');
        done();
    });
});

describe("Hex to RGB conversion", function() {
    var url = "http://localhost:3000/";

    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
});
// describe('#login()', function() {

//   // add a test hook
//   beforeEach(function() {
//     // ...some logic before each test is run
//     let blob = new Blob
//   })
  
//   // test a functionality
//   it('should see the Connect Wallet button', function() {
//     // add an assertion
//     expect(blob.to.not.equal(null));
//     expect(sum(1, 2, 3, 4, 5)).to.equal(15);
//   })
  
//   // ...some more tests
  
// })

// var assert = require('assert');
// describe('io', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });