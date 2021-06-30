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