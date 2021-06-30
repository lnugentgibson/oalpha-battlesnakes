var crypto = require('crypto');

function Point(x, y) {
  Object.defineProperties(this, {
    x: {
      get: () => x,
      set: v => x = v,
      enumerable: true
    },
    y: {
      get: () => y,
      set: v => y = v,
      enumerable: true
    }
  });

  function equals(other) {
    return other.x == x && other.y == y;
  }
  
  function toString() {
    return `Point(${x},${y})`;
  }
  
  function hash() {
    var md5 = crypto.createHash('md5');
    md5.update(toString());
    return md5.digest('hex');
  }
  
  Object.assign(this, {
    equals,
    toString,
    hash
  });
}

module.exports = Point;