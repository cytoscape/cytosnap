var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var browserify = require('browserify');
var fs = require('fs');

var safeCall = function( fn, args ){
  if( fn ){
    args = args || [];

    fn.apply( fn, args );
  }
};

var browserifyPhantomSrc = function(){
  return new Promise(function( resolve, reject ){
    browserify()
      .add('./phantom/index.js')
      .bundle()
      .on( 'end', resolve )
      .pipe( fs.createWriteStream('./phantom/index.pack.js') )
  });
};

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
  }).then(function(){
    safeCall( next );
  });
};

proto.stop = function( next ){
  var snap = this;

  return Promise.try(function(){
    snap.phantom.exit();
  }).then(function(){
    snap.running = false;
  }).then(function(){
    safeCall( next );
  });
};

proto.shot = function( opts, next ){
  var snap = this;
  var page;

  opts = _.assign( {
    // defaults
  }, opts );

  return Promise.try(function(){
    return browserifyPhantomSrc();
  }).then(function(){
    return snap.phantom.createPage();
  }).then(function( phantomPage ){
    page = phantomPage;

    return page.open('./phantom/index.html');
  }).then(function(){
    var js = 'function(){ window.options = JSON.parse("' + JSON.stringify( opts ) + '"); }';

    return page.evaluateJavaScript( js );
  }).then(function(){
    return page.evaluate(function(){
      // TODO use `options` and `cy` to return an image here

      return 'img TODO';
    });
  }).then(function( img ){
    page.close();

    return img;
  }).then(function( img ){
    safeCall( next, [ img ] );

    return img;
  });
};

module.exports = Cytosnap;
