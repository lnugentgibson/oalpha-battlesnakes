var Point = require('./point.js');

var p = new Point(0,0);
console.log(p.toString());
console.log(p.hash());
p = new Point(2, 3);
console.log(p.toString());
console.log(p.hash());
p = new Point(10, 8);
console.log(p.toString());
console.log(p.hash());