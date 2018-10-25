// var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var browserify = require('browserify');
var fs = require('fs');
var base64 = require('base64-stream');
var stream = require('stream');
var path = require('path');
var os = require('os');
var puppeteer = require('puppeteer');

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
      .add( path.join(__dirname, './phantom/index.js') )
      .bundle()
      .on( 'end', resolve )
      .pipe( fs.createWriteStream( path.join(__dirname, './phantom/index.pack.js') ) )
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
    return puppeteer.launch({ headless: true });
  }).then(function( browser ){
    snap.browser = browser;

    snap.running = true;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

proto.stop = function( next ){
  var snap = this;

  return Promise.try(function(){
    snap.browser.close();
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
    layout: { name: 'grid' },
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
    return snap.browser.newPage();
  }).then(function( puppeteerPage ){
    page = puppeteerPage;
  }).then(function(){
    return page.setViewport({ width: opts.width, height: opts.height });
  }).then(function(){
    var patchUri = function(uri){
      if( os.platform() === 'win32' ){
        return '/' + uri.replace(/\\/g, '/');
      } else {
        return uri;
      }
    };

    return page.goto( 'file://' + patchUri(path.join(__dirname, './phantom/index.html')) );
  }).then(function(){
    if( !_.isFunction( opts.style ) ){ return Promise.resolve(); }

    var js = 'window.styleFunction = (' + opts.style + ')';

    return page.evaluate( js );
  }).then(function(){
    if( !_.isFunction( opts.layout ) ){ return Promise.resolve(); }

    var js = 'window.layoutFunction = (' + opts.layout + ')';

    return page.evaluate( js );
  }).then(function(){
    var js = 'window.options = ( ' + JSON.stringify(opts) + ' )';

    return page.evaluate( js );
  }).then(function(){
    var js = 'document.body.style.setProperty("background", "' + opts.background + '")';

    return page.evaluate( js );
  }).then(function(){

    return page.evaluate(function(){
      if( window.layoutFunction ){ options.layout = layoutFunction(); }

      if( window.styleFunction ){ options.style = styleFunction(); }

      cy.style( options.style );

      cy.add( options.elements );

      var layoutDone = cy.promiseOn('layoutstop');

      cy.makeLayout( options.layout ).run(); // n.b. makeLayout used in case cytoscape@2 support is desired

      return layoutDone;
    });
  }).then(function(){
    if( opts.resolveTo === 'json' ){ return null; } // can skip in json case

    return page.screenshot({ type: opts.format, quality: opts.quality, encoding: 'base64' });
  }).then(function( b64Img ){
    switch( opts.resolvesTo ){
      case 'base64uri':
        return 'data:image/' + opts.format + ';base64,' + b64Img;
      case 'base64':
        return b64Img;
      case 'stream':
        return getStream( b64Img ).pipe( base64.decode() );
      case 'json':
        return page.evaluate(function(s){
          var posns = {};

          cy.nodes().forEach(function(n){
            posns[ n.id() ] = n.position();
          });

          return posns;
        });
      default:
        throw new Exception('Invalid resolve type specified: ' + opts.resolvesTo);
    }
  }).then(function( img ){
    return page.close().then(function(){ return img; });
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

module.exports = Cytosnap;
