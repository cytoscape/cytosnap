// prep the page and expose globals that we can reference from node

/* global window, document */

var cytoscape = window.cytoscape = require('cytoscape');

window.addEventListener('DOMContentLoaded', function(){
  window.cy = cytoscape({
    container: document.getElementById('cy')
  });
});
