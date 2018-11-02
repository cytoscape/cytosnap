let Promise = require('bluebird');
let browserify = require('browserify');
let fs = require('fs');
let base64 = require('base64-stream');
let stream = require('stream');
let path = require('path');
let os = require('os');
let puppeteer = require('puppeteer');
let typeofFn = typeof function(){};
let isFunction = x => typeof x === typeofFn;

let callbackifyValue = function( fn ){
  return function( val ){
    if( isFunction(fn) ){ fn( null, val ); }

    return val;
  };
};

let callbackifyError = function( fn ){
  return function( err ){
    if( isFunction(fn) ){ fn( err ); }

    throw err;
  };
};


let getStream = function( text ){
  let s = new stream.Duplex();

  s.push( text );
  s.push( null );

  return s;
};

let browserSrc;

let browserifyBrowserSrc = function(){
  if( browserSrc != null ){
    return browserSrc;
  }

  browserSrc = new Promise(function( resolve ){
    browserify()
      .add( path.join(__dirname, './browser/index.js') )
      .bundle()
      .on( 'end', resolve )
      .pipe( fs.createWriteStream( path.join(__dirname, './browser/index.pack.js') ) );
  });

  return browserSrc;
};

let Cytosnap = function( opts ){
  if( !(this instanceof Cytosnap) ){
    return new Cytosnap( opts );
  }

  this.options = Object.assign( {
    // defaults

  }, opts );

  this.running = false;
};

let proto = Cytosnap.prototype;

proto.start = function( next ){
  let snap = this;

  return Promise.try(function(){
    return puppeteer.launch({ headless: true });
  }).then(function( browser ){
    snap.browser = browser;

    snap.running = true;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

proto.stop = function( next ){
  let snap = this;

  return Promise.try(function(){
    snap.browser.close();
  }).then(function(){
    snap.running = false;
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

proto.shot = function( opts, next ){
  let snap = this;
  let page;

  opts = Object.assign( {
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
    return browserifyBrowserSrc();
  }).then(function(){
    return snap.browser.newPage();
  }).then(function( puppeteerPage ){
    page = puppeteerPage;
  }).then(function(){
    return page.setViewport({ width: opts.width, height: opts.height });
  }).then(function(){
    let patchUri = function(uri){
      if( os.platform() === 'win32' ){
        return '/' + uri.replace(/\\/g, '/');
      } else {
        return uri;
      }
    };

    return page.goto( 'file://' + patchUri(path.join(__dirname, './browser/index.html')) );
  }).then(function(){
    if( !isFunction( opts.style ) ){ return Promise.resolve(); }

    let js = 'window.styleFunction = (' + opts.style + ')';

    return page.evaluate( js );
  }).then(function(){
    if( !isFunction( opts.layout ) ){ return Promise.resolve(); }

    let js = 'window.layoutFunction = (' + opts.layout + ')';

    return page.evaluate( js );
  }).then(function(){
    let js = 'window.options = ( ' + JSON.stringify(opts) + ' )';

    return page.evaluate( js );
  }).then(function(){
    let js = 'document.body.style.setProperty("background", "' + opts.background + '")';

    return page.evaluate( js );
  }).then(function(){

    return page.evaluate(function(){
      /* global window, options, cy, layoutFunction, styleFunction */
      if( window.layoutFunction ){ options.layout = layoutFunction(); }

      if( window.styleFunction ){ options.style = styleFunction(); }

      cy.style( options.style );

      cy.add( options.elements );

      let layoutDone = cy.promiseOn('layoutstop');

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
        return page.evaluate(function(){
          let posns = {};

          cy.nodes().forEach(function(n){
            posns[ n.id() ] = n.position();
          });

          return posns;
        });
      default:
        throw new Error('Invalid resolve type specified: ' + opts.resolvesTo);
    }
  }).then(function( img ){
    return page.close().then(function(){ return img; });
  }).then( callbackifyValue(next) ).catch( callbackifyError(next) );
};

module.exports = Cytosnap;
