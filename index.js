var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var browserify = require('browserify');
var fs = require('fs');

var callbackifyValue = function( fn ){
  return function( val ){
    if( _.isFunction(fn) ){ fn( null, val ); }

    return val;
  };
};

var callbackifyError = function( fn ){
  return function( err ){
    if( _.isFunction(fn) ){ fn( err ); }

    throw err;
  };
};

var browserifyPhantomSrc = _.memoize( function(){
  return new Promise(function( resolve, reject ){
    browserify()
      .add('./phantom/index.js')
      .bundle()
      .on( 'end', resolve )
      .pipe( fs.createWriteStream('./phantom/index.pack.js') )
  });
}, function(){ return 'staticKey'; } );

var Cytosnap = function( opts ){
  if( !(this instanceof Cytosnap) ){
    return new Cytosnap( opts );
  }

  this.options = _.assign( {
    // defaults

  }, opts );

  this.running = false;
};

var proto = Cytosnap.prototype;

proto.start = function( next ){
  var snap = this;

  return Promise.try(function(){
    return phantom.create();
  }).then(function( phantomInstance ){
    snap.phantom = phantomInstance;

    snap.running = true;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

proto.stop = function( next ){
  var snap = this;

  return Promise.try(function(){
    snap.phantom.exit();
  }).then(function(){
    snap.running = false;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

proto.shot = function( opts, next ){
  var snap = this;
  var page;

  opts = _.assign( {
    // defaults
    graph: {
      elements: [],
      style: [],
      layout: undefined
    },
    image: {
      format: 'png'
    }
  }, opts );

  return Promise.try(function(){
    return browserifyPhantomSrc();
  }).then(function(){
    return snap.phantom.createPage();
  }).then(function( phantomPage ){
    page = phantomPage;

    return page.open('./phantom/index.html');
  }).then(function(){
    var js = 'function(){ window.options = JSON.parse(\'' + JSON.stringify( opts ) + '\'); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    var finishing = new Promise(function( resolve, reject ){
      page.on('onAlert', function( msg ){
        resolve( msg );
      });
    });

    var evalling = page.evaluate(function(){
      cy.style().fromJson( options.graph.style );

      cy.add( options.graph.elements );

      cy.on('layoutstop', function(){
        alert('layoutstop');
      });

      cy.layout( options.graph.layout );
    });

    return Promise.all([ finishing, evalling ]);
  }).then(function(){
    return page.evaluate(function(){
      return cy[ options.image.format ]( options.image );
    });
  }).then(function( img ){
    page.close();

    return img;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

module.exports = Cytosnap;
