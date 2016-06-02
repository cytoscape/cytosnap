var phantom = require('phantom');
var cytoscape = require('cytoscape');
var bluebird = require('bluebird');
var lodash = require('lodash');

var Cytosnap = function( opts ){
  if( !(this instanceof Cytosnap) ){
    return new Cytosnap( opts );
  }

  this.options = _.assign( {
    // defaults
    autostart: true
  }, opts );

  if( this.options.autostart ){
    this.start();
  }
};

var csp = Cytosnap.prototype;

csp.start = function(){
  // TODO
};

csp.stop = function(){
  // TODO
};

csp.snap = function(){
  // TODO
};

module.exports = Cytosnap;
