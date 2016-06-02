var phantom = require('phantom');
var cytoscape = require('cytoscape');
var Promise = require('bluebird');
var _ = require('lodash');
var safeCall = function( fn, args ){
  if( fn ){
    args = args || [];

    fn.apply( fn, args );
  }
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
    return snap.phantom.createPage();
  }).then(function( phantomPage ){
    page = phantomPage;

    return page.open('./phantom/index.html');
  }).then(function( status ){
    var img = null; // TODO generate image

    page.close();

    return img;
  }).then(function( img ){
    safeCall( next, [ img ] );

    return img;
  });
};

module.exports = Cytosnap;
