var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var browserify = require('browserify');
var fs = require('fs');
var base64 = require('base64-stream');
var stream = require('stream');
var Readable = stream.Readable;

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

var getStream = function( text ){
  var stream = new Readable();

  stream.push( text );
  stream.push( null );

  return stream;
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
    elements: [],
    style: [],
    layout: undefined,
    format: 'png',
    full: true,
    resolvesTo: 'base64uri'
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
      cy.style().fromJson( options.style );

      cy.add( options.elements );

      cy.on('layoutstop', function(){
        alert('layoutstop');
      });

      cy.layout( options.layout );
    });

    return Promise.all([ finishing, evalling ]);
  }).then(function(){
    return page.evaluate(function(){
      return cy[ options.format ]({
        bg: options.bg,
        full: options.full,
        scale: options.scale,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight
      });
    });
  }).then(function( b64Img ){
    page.close();

    return b64Img;
  }).then(function( b64ImgUri ){
    var marker = ';base64,';
    var index = b64ImgUri.indexOf( marker );
    var b64Img = b64ImgUri.substr( index + marker.length );

    switch( opts.resolvesTo ){
      case 'base64uri':
        return b64ImgUri;
      case 'base64':
        return b64Img;
      case 'stream':
        return getStream( b64Img ).pipe( base64.decode() );
      default:
        throw new Exception('Invalid resolve type specified: ' + opts.resolvesTo);
    }
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

module.exports = Cytosnap;
