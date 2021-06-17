const {
  //Dijkstra,
  FloodFill
} = require('./common.js');

//Dijkstra(7, 7, 16, 17, {});
//Dijkstra(7, 7, 16, 42, {});
//Dijkstra(7, 7, 16, 42, {15: true, 22: true, 23: true});
//Dijkstra(11, 11, 109, 64, {104: true,105: true,106: true,107: true,108: true}, true);

console.log(JSON.stringify(FloodFill(5, 5, 11, {10: true, 0: true, 5: true, 20: true, 12: true, 18: true, 19: true, 1: true, 7: true}), null, 2));