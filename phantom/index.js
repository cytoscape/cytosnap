// prep the phantomjs page and expose globals that we can reference from node

var cytoscape = window.cytoscape = require('cytoscape');

window.addEventListener('DOMContentLoaded', function(){
  var cy = window.cy = cytoscape({
    container: document.getElementById('cy')
  });
});
