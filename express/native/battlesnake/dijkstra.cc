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