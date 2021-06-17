const MinHeap = require("./heap.js");

function SnakeState(data) {
  let {
    id,
    name,
    latency,
    health,
    body,
    head,
    length,
    shout
  } = data;
  Object.defineProperties(this, {
    id: { get: () => id, enumerable: true },
    name: { get: () => name, enumerable: true },
    latency: { get: () => latency, enumerable: true },
    health: { get: () => health, enumerable: true },
    body: { get: () => body, enumerable: true },
    //body: { get: () => (i => body[i]) },
    head: { get: () => head, enumerable: true },
    length: { get: () => length, enumerable: true },
    shout: { get: () => shout, enumerable: true },
  });
}
function GameState(data) {
  let {
    game: {
      id: gameId,
      ruleset,
      timeout
    },
    turn,
    board: {
      width,
      height,
      food,
      hazards
    }
  } = data;
  var snakes = data.board.snakes.map(s => new SnakeState(s));
  var you = new SnakeState(data.you);
  Object.defineProperties(this, {
    gameId: { get: () => gameId, enumerable: true },
    ruleset: { get: () => ruleset, enumerable: true },
    timeout: { get: () => timeout, enumerable: true },
    turn: { get: () => turn, enumerable: true },
    width: { get: () => width, enumerable: true },
    height: { get: () => height, enumerable: true },
    snakes: { get: () => snakes, enumerable: true },
    food: { get: () => food, enumerable: true },
    hazard: { get: () => (i => hazards[i]), enumerable: true },
    you: { get: () => you, enumerable: true },
    snakeId: { get: () => you.id, enumerable: true },
    name: { get: () => you.name, enumerable: true },
    latency: { get: () => you.latency, enumerable: true },
    health: { get: () => you.health, enumerable: true },
    body: { get: () => you.body, enumerable: true },
    head: { get: () => you.head, enumerable: true },
    length: { get: () => you.length, enumerable: true },
    shout: { get: () => you.shout, enumerable: true },
  });
}

function Dijkstra(width, height, source, target, disallowed, debug) {
  var N = width * height;
  
  var dist = {
    [source]: 0
  };
  var prev = {};
  var visited = {};

  var queue = new MinHeap();

  for(var i = 0; i < N; i++)
    (j => {
      if(i != source) {
        dist[j] = N;
      }
      queue.add(dist[j], j);
    })(i);
  if(debug) queue.print();

  var it = 0, d, id;
  while(!queue.isEmpty() && it < N) {
    if(debug) console.log(`it: ${it}`);
    var t = queue.remove();
    //console.log(`queue.remove() = ${t}`);
    d = t[0];
    id = t[1];
    visited[id] = true;
    if(debug) console.log(`d: ${d}, id: ${id}, queue.length: ${queue.length()}`);
    //queue.print();
    if(id == target) {
      if(debug) console.log(`target found: distance is ${dist[id]}`);
      break;
    }
    var D = d + 1;
    [-1,1,-width,width].forEach(shift => {
      var I = id + shift;
      if(debug) console.log(`\tchecking index ${I}`);
      if(visited[I]) {
        //console.log('\tindex disallowed');
        return;
      }
      if(id % width == 0 && shift == -1) return;
      if(id % width == width - 1 && shift == 1) return;
      if(I < 0 || I >= N) {
        //console.log('\tindex out of bounds');
        return;
      }
      if(disallowed[I]) {
        //console.log('\tindex disallowed');
        return;
      }
      //console.log(`\tprevious distance: ${dist[id]}`);
      if(D < dist[I]) {
        if(debug) console.log(`\tnew distance, ${D} shorter: swapping`);
        dist[I] = D;
        prev[I] = id;
        var hi = queue.indexOf(I);
        if(hi != -1)
          queue.setKey(hi, D);
      }
    });
    it++;
  }
  it = 0;
  var path = [target];
  if(debug) console.log(path);
  while(path[0] != source && it < N) {
    path.splice(0, 0, prev[path[0]]);
    if(debug) console.log(path);
    it++;
  }
  if(debug) console.log(path);
  
  return {dist, prev, path};
}

function FloodFill(width, height, source, disallowed) {
  var N = width * height;
  
  var cells = [], index = {};
  var queue = [source];
  
  while(queue.length > 0) {
    var cell = queue.splice(0, 1)[0];
    if(index[cell]) continue;
    cells.push(cell);
    index[cell] = true;
    [-1,1,-width,width].forEach(shift => {
      var neighbor = cell + shift;
      if(index[neighbor]) return;
      if(neighbor < 0 || neighbor > N) return;
      if(cell % width == 0 && shift == -1) return;
      if(cell % width == width - 1 && shift == 1) return;
      if(disallowed[neighbor]) return;
      queue.push(neighbor);
    });
  }
  
  return {
    cells,
    index,
    length: cells.length
  };
}

module.exports = {
  SnakeState,
  GameState,
  Dijkstra,
  FloodFill
};