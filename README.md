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
  return snap.shot({
    elements: [ // http://js.cytoscape.org/#notation/elements-json
      { data: { id: 'foo' } },
      { data: { id: 'bar' } },
      { data: { source: 'foo', target: 'bar' } }
    ],
    layout: { // http://js.cytoscape.org/#init-opts/layout
      name: 'grid'
    },
    style: [ // http://js.cytoscape.org/#style
      {
        selector: 'node',
        style: {
          'background-color': 'red'
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': 'red'
        }
      }
    ],
    resolvesTo: 'base64uri',
    format: 'png',
    width: 640,
    height: 480,
    background: 'transparent'
  });
}).then(function( img ){
  // do whatever you want with img
  console.log( img );
});
```

### cytosnap()

Initialise an instance of Cytosnap:

```js
var snap = cytosnap();

// or

var snap = new cytosnap();
```

### snap.start( [next] )

Start up the Cytosnap instance, `snap`, so we can request that it generate images:

Promise style:
```js
snap.start().then(function(){ // promise resolved on start
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
  // cytoscape.js options
  elements: undefined, // cytoscape.js elements json
  style: undefined, // a cytoscape.js stylesheet in json format
  layout: undefined // a cytoscape.js layout options object

  // image export options
  resolvesTo: 'base64uri', // output, one of 'base64uri' (default), 'base64', or 'stream'
  format: 'png', // 'png' or 'jpg'/'jpeg'
  quality: 85, // quality of jpg export, 0 (low) to 100 (high)
  background: 'transparent', // a css colour for the background (transparent by default)
  width: 200, // the width of the image in pixels
  height: 200 // the height of the image in pixels
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
snap.stop().then(function(){ // promise resolved on stop
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
