var chai = require('chai');
var expect = chai.expect;
var cytosnap = require('..');

describe('Output', function(){
  var snap;

  beforeEach(function( done ){ // setup
    snap = cytosnap();

    snap.start( done );
  });

  afterEach(function( done ){ // teardown
    snap.stop().then(function(){
      snap = null;
    }).then( done );
  });

  it('should be an existing file', function( done ){
    snap.shot().then(function( img ){
      console.log( img );

      expect( img ).to.exist;
    }).then( done );
  });

  it('should be a png when so specified', function(){
    expect( true ).to.be.true; // TODO
  });

  it('should be a jpg when so specified', function(){
    expect( true ).to.be.true; // TODO
  });
});
