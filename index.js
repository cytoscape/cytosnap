var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var browserify = require('browserify');
var fs = require('fs');
var base64 = require('base64-stream');
var stream = require('stream');

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
  var s = new stream.Duplex();

  s.push( text );
  s.push( null );

  return s;
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
    background: 'transparent',
    quality: 85,
    width: 200,
    height: 200,
    resolvesTo: 'base64uri'
  }, opts );

  if( opts.format === 'jpg' ){
    opts.format = 'jpeg';
  } else if( opts.format === 'png' ){
    opts.quality = 0; // most compression
  }

  return Promise.try(function(){
    return browserifyPhantomSrc();
  }).then(function(){
    return snap.phantom.createPage();
  }).then(function( phantomPage ){
    page = phantomPage;
  }).then(function(){
    return page.property('viewportSize', { width: opts.width, height: opts.height });
  }).then(function(){
    return page.open('./phantom/index.html');
  }).then(function(){
    if( !_.isFunction( opts.style ) ){ return Promise.resolve(); }

    var js = 'function(){ window.styleFunction = (' + opts.style + '); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    if( !_.isFunction( opts.layout ) ){ return Promise.resolve(); }

    var js = 'function(){ window.layoutFunction = (' + opts.layout + '); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    var js = 'function(){ window.options = JSON.parse(\'' + JSON.stringify( opts ) + '\'); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    var js = 'function(){ document.body.style.setProperty("background", "' + opts.background + '"); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    var finishing = new Promise(function( resolve, reject ){
      page.on('onAlert', function( msg ){
        resolve( msg );
      });
    });

    var evalling = page.evaluate(function(){
      if( window.layoutFunction ){ options.layout = layoutFunction(); }

      if( window.styleFunction ){ options.style = styleFunction(); }

      cy.style( options.style );

      cy.add( options.elements );

      cy.on('layoutstop', function(){
        alert('layoutstop');
      });

      cy.layout( options.layout );
    });

    return Promise.all([ finishing, evalling ]);
  }).then(function(){
    return page.renderBase64( opts.format, opts.quality );
  }).then(function( b64Img ){
    switch( opts.resolvesTo ){
      case 'base64uri':
        return 'data:image/' + opts.format + ';base64,' + b64Img;
      case 'base64':
        return b64Img;
      case 'stream':
        return getStream( b64Img ).pipe( base64.decode() );
      default:
        throw new Exception('Invalid resolve type specified: ' + opts.resolvesTo);
    }
  }).then(function( img ){
    page.close();

    return img;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

module.exports = Cytosnap;
