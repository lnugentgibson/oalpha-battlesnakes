const _ = require('lodash');

const {
  DIRECTION
} = require("./enums.js");

const {
  SNAKE_MAX_HEALTH,
  SNAKE_STARTER_SIZE
} = require("./globals.js");

const Point = require('./point.js');

function Snake(ID) {
  this.health = SNAKE_MAX_HEALTH;
  this.body = [];
  this.name = "";
  this.ID = ID;
  this.size = SNAKE_STARTER_SIZE;
  this.alive = true;

  function assign_start_position(start_position) {
    _.times(this.size, () => this.body.append(start_position));
  }
  
  Object.defineProperties(this, {
    head: {
      get: () => this.body[0],
      enumerable: true
    }
  });

  function all_possible_moves() {
    if(!this.body)
      return [];

    return [
      new Point(this.head.x - 1, this.head.y),
      new Point(this.head.x + 1, this.head.y),
      new Point(this.head.x, this.head.y - 1),
      new Point(this.head.x, this.head.y + 1),
    ];
  }

  function all_positions_at(distance) {
    return [
      new Point(this.head.x - distance, this.head.y - distance),
      new Point(this.head.x + distance, this.head.y + distance),
      new Point(this.head.x - distance, this.head.y - 1 + distance),
      new Point(this.head.x + distance, this.head.y + 1 - distance),
    ];
  }

  function move(direction) {
    var new_head = new Point(this.head.x, this.head.y);
    if(direction == DIRECTION.DOWN)
        new_head.y += 1;
    else if(direction == DIRECTION.LEFT)
        new_head.x -= 1;
    else if(direction == DIRECTION.RIGHT)
        new_head.x += 1;
    else if(direction == DIRECTION.UP)
        new_head.y -= 1;
    else {
      var dx = this.body[0].x - this.body[1].x;
      var dy = this.body[0].y - this.body[1].y;
      if(dx == 0 && dy == 0)
          dy = 1;
      new_head.x += dx;
      new_head.y += dy;
    }

    this.body.splice(0, 0, new_head);
    this.body.pop();
  }

  function feed() {
    this.health = SNAKE_MAX_HEALTH
    this.body.push(this.body[this.body.length - 1]);
  }

  function colliding_with(snake) {
    snake.body.forEach(body_part => {
      if(body_part.equals(snake.head))
        return;

      if(body_part.equals(this.head))
        return true;
    });
    return false;
  }
  
  Object.assign(this, {
    assign_start_position,
    all_possible_moves,
    all_positions_at,
    move,
    feed,
    colliding_with
  });
}

module.exports = Snake;