const {
  Dijkstra
} = require('./common.js');

Dijkstra(7, 7, 16, 17, {});
//console.log(Object.assign({source: 16, target: 17}, Dijkstra(7, 7, 16, 17, {})));
Dijkstra(7, 7, 16, 42, {});
//console.log(Object.assign({source: 16, target: 84}, Dijkstra(7, 7, 16, 84, {})));
Dijkstra(7, 7, 16, 42, {15: true, 22: true, 23: true});
//console.log(Object.assign({source: 16, target: 84}, Dijkstra(7, 7, 16, 84, {})));
Dijkstra(11, 11, 109, 64, {104: true,105: true,106: true,107: true,108: true}, true);