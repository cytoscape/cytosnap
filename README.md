# Cytosnap

[![Join the chat at https://gitter.im/cytoscape/cytosnap](https://badges.gitter.im/cytoscape/cytosnap.svg)](https://gitter.im/cytoscape/cytosnap?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/cytoscape/cytosnap.svg?branch=master)](https://travis-ci.org/cytoscape/cytosnap)

Render graphs on the server side with [Cytoscape.js](http://js.cytoscape.org), getting image files as output.  This package uses [Puppeteer](https://pptr.dev) to generate the output.  Refer to the [Puppeteer documentation](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#troubleshooting) to ensure that your machine is configured properly to run Chrome headlessly.

This project was initiated [at MozSprint 2016](https://github.com/mozillascience/global-sprint-2016/issues/25)


## How to contribute

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md).


## Usage

Quick start example:

```js
var cytosnap = require('cytosnap');

// list of layout extensions to use
// NB you must `npm install` these yourself for your project
cytosnap.use([ 'cytoscape-dagre', 'cytoscape-cose-bilkent' ]);

var snap = cytosnap();

snap.start().then(function(){
  return snap.shot({
    elements: [ // http://js.cytoscape.org/#notation/elements-json
      { data: { id: 'foo' } },
      { data: { id: 'bar' } },
      { data: { source: 'foo', target: 'bar' } }
    ],
    layout: { // http://js.cytoscape.org/#init-opts/layout
      name: 'grid' // you may reference a `cytoscape.use()`d extension name here
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

### cytosnap.use()

Pull in layout extensions that you may used in the exported images:

```js
cytosnap.use([ 'cytoscape-dagre', 'cytoscape-cose-bilkent' ]);
```

Each string is an npm package name that can be pulled in by `require()`.  The list of extension package names that you specify is static:  You may specify the list only once, so make sure the list includes all layouts you want to run.  Every `snap` object shares the same extension list.

### cytosnap()

Initialise an instance of Cytosnap:

```js
var options = {};

var snap = cytosnap(options);

// or

var snap = new cytosnap(options);
```

The options you can pass include:

- `args` : An array of argument strings to pass to Puppeteer.  This is useful for disabling Chrome's sandbox for Travis.  See the [Puppeteer docs](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#troubleshooting) for more info.

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
  style: undefined, // a cytoscape.js stylesheet in json format (or a function that returns it)
  layout: undefined // a cytoscape.js layout options object (or a function that returns it)
  // (specifying style or layout via a function is useful in cases where you can't send properly serialisable json)

  // image export options
  resolvesTo: 'base64uri', // output, one of 'base64uri' (default), 'base64', 'stream', or 'json' (export resultant node positions from layout)
  format: 'png', // 'png' or 'jpg'/'jpeg' (n/a if resolvesTo: 'json')
  quality: 85, // quality of image if exporting jpg format, 0 (low) to 100 (high)
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
