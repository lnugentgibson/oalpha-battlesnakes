module.exports = function MinHeap() {
  function left(i) {
    return 2 * (i + 1) - 1;
  }
  function right(i) {
    return 2 * (i + 1);
  }
  function parent(i) {
    return Math.floor((i + 1) / 2) - 1;
  }
  function up(i) {
    var c = heap[i][0];
    var j = parent(i);
    while(j >= 0) {
      var p = heap[j][0];
      if(c < p) {
        var t = heap[i];
        heap[i] = heap[j];
        heap[j] = t;
      }
      else return;
      i = j;
      j = parent(i);
    }
  }
  function down(i) {
    var p = heap[i][0];
    var j = left(i);
    while(j < heap.length) {
      var c = heap[j][0];
      if(c < p) {
        var t = heap[i];
        heap[i] = heap[j];
        heap[j] = t;
        i = j;
      }
      else {
        var k = right(i);
        if(k >= heap.length) return;
        c = heap[k][0];
        if(c < p) {
          t = heap[i];
          heap[i] = heap[k];
          heap[k] = t;
          i = k;
        }
        else return;
      }
      j = left(i);
    }
  }
  var heap = [];
  this.add = function(key, val) {
    heap.push([key, val]);
    up(heap.length - 1);
  };
  this.remove = function() {
    var t = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.splice(heap.length - 1, 1);
    if(heap.length > 0)
      down(0);
    return t;
  };
  function print(i, p) {
    if(i >= heap.length) return;
    print(left(i), p + '  ');
    console.log(p + heap[i][0] + ': ' + heap[i][1]);
    print(right(i), p + '  ');
  }
  this.print = function() {
    console.log(`length: ${heap.length}`);
    print(0, '');
  };
  this.isEmpty = function() {
    return heap.length == 0;
  };
  this.length = function() {
    return heap.length;
  };
  this.indexOf = function(v, f) {
    var i;
    if(heap.some((e, j) => {
      if(f ? f.call(null, v, e[1]) : e[1] == v) {
        i = j;
        return true;
      }
      return false;
    })) return i;
    return -1;
  };
  this.setKey = function(i, k) {
    if(heap[i] == undefined) {
      throw {
        length: heap.length,
        i,
        k
      };
    }
    heap[i][0] = k;
    up(i);
    down(i);
  };
};