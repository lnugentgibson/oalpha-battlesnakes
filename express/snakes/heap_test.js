const MinHeap = require("./heap.js");

var heap = new MinHeap();
for(var i = 0; i < 20; i++) {
  heap.add(Math.random() * 10, i);
}
heap.print();
for(i = 0; i < 3; i++) {
  console.log(heap.remove());
  console.log('-------------------------------------------------------');
  heap.print();
}