var chai = require('chai');
var expect = chai.expect;
var cytosnap = require('../');
var Promise = require('bluebird');

describe('Service', function(){
  var snap;

  before(function( done ){
    snap = cytosnap();

    snap.start().then( done );
  });

  it('should run async in bg', function( done ){
    Promise.delay( 1000 ).then(function(){
      expect( snap.running ).to.be.true;
    }).then( done );
  });

  it('should stop when requested', function( done ){
    snap.stop().then(function(){
      expect( snap.running ).to.be.false;
    }).then( done );
  });
});
