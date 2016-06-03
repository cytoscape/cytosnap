var chai = require('chai');
var expect = chai.expect;
var cytosnap = require('..');

describe('Output', function(){
  var snap;

  this.timeout( 10000 );

  beforeEach(function( done ){ // setup
    snap = cytosnap();

    snap.start().then( done );
  });

  afterEach(function( done ){ // teardown
    snap.stop().then(function(){
      snap = null;
    }).then( done );
  });

  it('should exist (png)', function( done ){
    snap.shot({
      elements: [
        {
          data: { id: 'foo' }
        },
        {
          data: { id: 'bar' }
        },
        {
          data: { source: 'foo', target: 'bar' }
        }
      ],
      format: 'png',
      width: 1000,
      height: 1000,
      resolvesTo: 'stream'
    }).then(function( img ){
      expect( img ).to.exist;
      return img;
    }).then(function( img ){
      // put the image in the fs for manual verification
      return new Promise(function( resolve ){
        var out = require('fs').createWriteStream('./test/img.png');

        img.pipe( out );

        out.on('finish', resolve);
      });
    }).then( done );
  });

  it('should exist (png)', function( done ){
    snap.shot({
      elements: [
        {
          data: { id: 'foo' }
        },
        {
          data: { id: 'bar' }
        },
        {
          data: { source: 'foo', target: 'bar' }
        }
      ],
      format: 'jpg',
      background: 'white',
      width: 1000,
      height: 1000,
      resolvesTo: 'stream'
    }).then(function( img ){
      expect( img ).to.exist;
      return img;
    }).then(function( img ){
      // put the image in the fs for manual verification
      return new Promise(function( resolve ){
        var out = require('fs').createWriteStream('./test/img.jpg');

        img.pipe( out );

        out.on('finish', resolve);
      });
    }).then( done );
  });

  it('should be a png when so specified', function( done ){
    snap.shot({
      format: 'png',
      resolvesTo: 'base64uri'
    }).then(function( img ){
      expect( img.indexOf('image/png') ).to.be.at.least(0);
    }).then( done );
  });

  it('should be a jpg when so specified', function( done ){
    snap.shot({
      format: 'jpg',
      resolvesTo: 'base64uri'
    }).then(function( img ){
      expect( img.indexOf('image/jpeg') ).to.be.at.least(0);
    }).then( done );
  });
});
