var chai = require('chai');
var expect = chai.expect;
var cytosnap = require('..');
var Promise = require('bluebird');

cytosnap.use([ 'cytoscape-dagre' ]);

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

  it('should exist (png via functions)', function( done ){
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
      style: function(){
        /* global cytoscape */
        return cytoscape.stylesheet()
          .selector('node')
            .style({
              'background-color': 'red'
            })
          .selector('edge')
            .style({
              'line-color': 'red'
            })
        ;
      },
      layout: function(){
        return { name: 'random' };
      },
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
        var out = require('fs').createWriteStream('./test/img.fn.png');

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

  it('should exist (png with dagre extension)', function( done ){
    snap.shot({
      elements: [
        { data: { id: 'n0' } },
        { data: { id: 'n1' } },
        { data: { id: 'n2' } },
        { data: { id: 'n3' } },
        { data: { id: 'n4' } },
        { data: { id: 'n5' } },
        { data: { id: 'n6' } },
        { data: { id: 'n7' } },
        { data: { id: 'n8' } },
        { data: { id: 'n9' } },
        { data: { id: 'n10' } },
        { data: { id: 'n11' } },
        { data: { id: 'n12' } },
        { data: { id: 'n13' } },
        { data: { id: 'n14' } },
        { data: { id: 'n15' } },
        { data: { id: 'n16' } },
        { data: { source: 'n0', target: 'n1' } },
        { data: { source: 'n1', target: 'n2' } },
        { data: { source: 'n1', target: 'n3' } },
        { data: { source: 'n4', target: 'n5' } },
        { data: { source: 'n4', target: 'n6' } },
        { data: { source: 'n6', target: 'n7' } },
        { data: { source: 'n6', target: 'n8' } },
        { data: { source: 'n8', target: 'n9' } },
        { data: { source: 'n8', target: 'n10' } },
        { data: { source: 'n11', target: 'n12' } },
        { data: { source: 'n12', target: 'n13' } },
        { data: { source: 'n13', target: 'n14' } },
        { data: { source: 'n13', target: 'n15' } }
      ],
      layout: {
        name: 'dagre'
      },
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
        var out = require('fs').createWriteStream('./test/img.dagre.jpg');

        img.pipe( out );

        out.on('finish', resolve);
      });
    }).then( done );
  });

  it('should exist (jpg with cose)', function( done ){
    snap.shot({
      elements: [
        { data: { id: 'n0' } },
        { data: { id: 'n1' } },
        { data: { id: 'n2' } },
        { data: { id: 'n3' } },
        { data: { id: 'n4' } },
        { data: { id: 'n5' } },
        { data: { id: 'n6' } },
        { data: { id: 'n7' } },
        { data: { id: 'n8' } },
        { data: { id: 'n9' } },
        { data: { id: 'n10' } },
        { data: { id: 'n11' } },
        { data: { id: 'n12' } },
        { data: { id: 'n13' } },
        { data: { id: 'n14' } },
        { data: { id: 'n15' } },
        { data: { id: 'n16' } },
        { data: { source: 'n0', target: 'n1' } },
        { data: { source: 'n1', target: 'n2' } },
        { data: { source: 'n1', target: 'n3' } },
        { data: { source: 'n4', target: 'n5' } },
        { data: { source: 'n4', target: 'n6' } },
        { data: { source: 'n6', target: 'n7' } },
        { data: { source: 'n6', target: 'n8' } },
        { data: { source: 'n8', target: 'n9' } },
        { data: { source: 'n8', target: 'n10' } },
        { data: { source: 'n11', target: 'n12' } },
        { data: { source: 'n12', target: 'n13' } },
        { data: { source: 'n13', target: 'n14' } },
        { data: { source: 'n13', target: 'n15' } }
      ],
      layout: {
        name: 'cose'
      },
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
        var out = require('fs').createWriteStream('./test/img.cose.jpg');

        img.pipe( out );

        out.on('finish', resolve);
      });
    }).then( done );
  });


  it('should exist (json)', function( done ){
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
      resolvesTo: 'json'
    }).then(function( posns ){
      expect( posns ).to.exist;

      expect( posns.foo ).to.exist;

      expect( posns.bar ).to.exist;

      expect( posns.foo.x ).to.be.a.number;
      expect( posns.foo.y ).to.be.a.number;

      expect( posns.bar.x ).to.be.a.number;
      expect( posns.bar.y ).to.be.a.number;

      return posns;
    }).then(function( posns ){
      // put the image in the fs for manual verification
      return new Promise(function( resolve ){
        var out = require('fs').createWriteStream('./test/out.json');

        out.write(JSON.stringify(posns));

        resolve();
      });
    }).then( done );
  });


  it('should exist (png w/ large no. of eles)', function( done ){
    snap.shot({
      elements: (function(){
        var eles = [];

        for( var i = 0; i < 1000; i++ ){
          eles.push({
            data: {
              id: 'ele'+i,
              foo: 'qweriwqernsdaflkhseoirpaasdjflsajdflkjaskldfjaklsdfjsdhfkashdfkhas;dfihaseir;ashdfl;kasjdflkjasdlfkhsadl;fhasldfhlsaasdfsadfsadfsadfsadfsadfasdfasdfdf',
              bar: 'sajdkfljaslkdfjklsadjflksajdflkjasdlkfjasl;dfj;lsakdjasdfkljsadklfjaskldfjlasdfjlkasdffjlkasdf;sadjflk;asjdfl;kjsadlfkjaslkasdfjklasdfjklsadfdfljksadf',
              baz: 'jaskldfjlkasdfjklsajdflkjasdflkjsalkdfjlksadjfl;sadjflk;sadjflk;jsadflkjsaklasdfsadfasdfasdfsaddfjl;asdfjasdjfklasjdflkjsadlfkjsalkdfjasdfls;akdjflk;sad'
            }
          });
        }

        return eles;
      })(),
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
        var out = require('fs').createWriteStream('./test/img.lg.png');

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
