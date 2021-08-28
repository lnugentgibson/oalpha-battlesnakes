const {
  expect
} = require('chai');

const lib = require("../../snakes/native.js");
let { NMinHeap } = lib;

describe('NMinHeap', function() {
  var indexCases = [[0, 1], [1, 3], [2, 5], [3, 7]];
  describe('left', function() {
    indexCases.forEach(function(indexCase) {
      let [parent, left] = indexCase;
      it('' + parent, function() {
        var heap = new NMinHeap();
        expect(heap.left(parent)).to.be.equal(left);
      });
    });
  });
  describe('right', function() {
    indexCases.forEach(function(indexCase) {
      let [parent, left] = indexCase;
      it('' + parent, function() {
        var heap = new NMinHeap();
        expect(heap.right(parent)).to.be.equal(left + 1);
      });
    });
  });
  describe('parent', function() {
    indexCases.forEach(function(indexCase) {
      let [parent, left] = indexCase;
      it('' + parent, function() {
        var heap = new NMinHeap();
        expect(heap.parent(left)).to.be.equal(parent);
        expect(heap.parent(left + 1)).to.be.equal(parent);
      });
    });
  });
  it('case 1', function() {
    var heap = new NMinHeap(), ret;
    
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    
    heap.add(5, 23);
    expect(heap.size()).to.equal(1);
    expect(heap.isEmpty()).to.false;
    
    ret = heap.remove();
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    expect(ret.key).to.equal(5);
    expect(ret.val).to.equal(23);
  });
  it('case 2', function() {
    var heap = new NMinHeap(), ret;
    
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    
    heap.add(5, 23);
    heap.add(2, 16);
    expect(heap.size()).to.equal(2);
    expect(heap.isEmpty()).to.false;
    
    ret = heap.remove();
    expect(heap.size()).to.equal(1);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val).to.equal(16);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    expect(ret.key).to.equal(5);
    expect(ret.val).to.equal(23);
  });
  it('case 3', function() {
    var heap = new NMinHeap(), ret;
    
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    
    heap.add(2, 16);
    heap.add(5, 23);
    expect(heap.size()).to.equal(2);
    expect(heap.isEmpty()).to.false;
    
    ret = heap.remove();
    expect(heap.size()).to.equal(1);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val).to.equal(16);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    expect(ret.key).to.equal(5);
    expect(ret.val).to.equal(23);
  });
  it('case 4', function() {
    var heap = new NMinHeap(), ret;
    
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    [[5, 23], [2, 16], [10, 6], [13, 2], [0, 5], [11, 13], [2, 30]].forEach(e => {
      let [a, b] = e;
      heap.add(a, b);
    });
    expect(heap.size()).to.equal(7);
    expect(heap.isEmpty()).to.false;
    
    ret = heap.remove();
    expect(heap.size()).to.equal(6);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(0);
    expect(ret.val).to.equal(5);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(5);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val == 16 || ret.val == 30).to.equal(true);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(4);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val == 16 || ret.val == 30).to.equal(true);
  });
  it('case 5', function() {
    var heap = new NMinHeap(), ret;
    
    expect(heap.size()).to.equal(0);
    expect(heap.isEmpty()).to.true;
    [[5, 23], [2, 16], [10, 6], [13, 2], [0, 5], [11, 13], [2, 30]].forEach(e => {
      let [a, b] = e;
      heap.add(a, b);
    });
    expect(heap.size()).to.equal(7);
    expect(heap.isEmpty()).to.false;
    
    heap.setKey(0, 7);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(6);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val == 16 || ret.val == 30).to.equal(true);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(5);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(2);
    expect(ret.val == 16 || ret.val == 30).to.equal(true);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(4);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(5);
    expect(ret.val).to.equal(23);
    
    ret = heap.remove();
    expect(heap.size()).to.equal(3);
    expect(heap.isEmpty()).to.false;
    expect(ret.key).to.equal(7);
    expect(ret.val).to.equal(5);
  });
});