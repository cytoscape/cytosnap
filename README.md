# Cytosnap

[![Join the chat at https://gitter.im/cytoscape/cytosnap](https://badges.gitter.im/cytoscape/cytosnap.svg)](https://gitter.im/cytoscape/cytosnap?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/cytoscape/cytosnap.svg?branch=master)](https://travis-ci.org/cytoscape/cytosnap)

Render graphs on the server side with [Cytoscape.js](http://js.cytoscape.org), getting image files as output

This project was initiated [at MozSprint 2016](https://github.com/mozillascience/global-sprint-2016/issues/25)


## How to contribute

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md).


## Usage

Quick start example:

```js
var cytosnap = require('cytosnap');
var snap = cytosnap();

snap.start().then(function(){
  return snap.shot({ /* options... */ });
}).then(function( img ){
  // do whatever you want with img
  console.log( img );
});
```

### cytosnap()

Initialise an instance of Cytosnap:

```js
var snap = cytosnap({
  // options:
  // TODO
});
```

### snap.start( [next] )

Start up the Cytosnap instance, `snap`, so we can request that it generate images:

Promise style:
```js
var startPromise = snap.start(); // promise resolved on start

startPromise.then(function(){
  console.log('chained start promise');
});
```

Node callback style using `next`:
```js
snap.start(function( err ){
  console.log('called on start');
});
```

### snap.shot( options, [next] )

Generate a snapshot of a graph:

```js
var defaultOptions = {
  resolvesTo: 'base64uri', // output, one of 'base64uri' (default), 'base64', or 'stream'

  // cytoscape.js init options
  elements: undefined, // cytoscape.js elements json
  style: undefined, // a cytoscape.js stylesheet in json format
  layout: undefined // a cytoscape.js layout options object

  // cytoscape.js image export options
  format: 'png', // 'png' or 'jpg'
  bg: undefined, // a css colour for the background (transparent by default)
  full: false, // whether to export the current viewport view (false, default) or the entire graph (true)
  scale: undefined, // this value specifies a positive number that scales the size of the resultant image
  maxWidth: undefined, // specifies the scale automatically in combination with maxHeight such that the resultant image is no wider than maxWidth
  maxHeight: undefined // specifies the scale automatically in combination with maxWidth such that the resultant image is no taller than maxHeight
};

// promise style
snap.shot( defaultOptions ).then(function( img ){
  console.log('on resolve');
}).catch(function( err ){
  console.log('on error');
});

// node callback style
snap.shot( defaultOptions, function( err, img ){
  console.log('on error or resolve');
} );
```

### snap.stop( [next] )

Stop the Cytosnap instance:

Promise style:
```js
var stopPromise = snap.stop(); // promise resolved on stop

stopPromise.then(function(){
  console.log('chained stop promise');
});
```

Node callback style using `next`:
```js
snap.stop(function( err ){
  console.log('called on stop');
});
```

## Targets

* `npm test` : Run Mocha tests in `./test`
