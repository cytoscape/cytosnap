var chai = require('chai');
var expect = chai.expect;
var cytosnap = require('..');

describe('Output', function(){
  var snap;

  beforeEach(function( done ){ // setup
    snap = cytosnap();

    snap.start().then( done );
  });

  afterEach(function( done ){ // teardown
    snap.stop().then(function(){
      snap = null;
    }).then( done );
  });

  it('should exist', function( done ){
    snap.shot({
      elements: [
        {} // 1 node
      ],
      returns: 'stream'
    }).then(function( img ){
      expect( img ).to.exist;

      // put the image in the fs for manual verification
      var out = require('fs').createWriteStream('./test/img.png');
      img.pipe( out );
    }).then( done );
  });

  it('should be a png when so specified', function(){
    expect( true ).to.be.true; // TODO
  });

  it('should be a jpg when so specified', function(){
    expect( true ).to.be.true; // TODO
  });
});
