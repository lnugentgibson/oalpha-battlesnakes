/**
 * This snake uses a state machine.
 */

//const fs = require('fs');
const _ = require('lodash');

const MOVES = ['right','up','left','down'];
const PRIORITY_MANDATORY = 1000;
const PRIORITY_HIGH = 8;
const PRIORITY_MID = 2;
const PRIORITY_LOW = 1;
const MOVE_STATE_FORBIDDEN = -1;
const MOVE_STATE_RECOMMENDED = 1;

const {
  Dijkstra,
  FloodFill
} = require('./common.js');

function cellIndex(width, cell) {
  return cell.y * width + cell.x;
}

function SnakeState(snake_0, game_0) {
  var id, name;
  
  var health, head, tail, start, end, length, body;
  
  var space = [];
  
  init(snake_0, game_0);
  
  function update(snake, game) {
    let {
      width,
      height
    } = game.board;
    
    // update health
    health = snake.health;
    
    // update length
    length = snake.length;
    
    // update position
    head = snake.head;
    start = cellIndex(width, head);
    tail = snake.body[length - 1];
    end = cellIndex(width, tail);
    body = snake.body.map((segment, i) => ({
      x: segment.x,
      y: segment.y,
      index: cellIndex(width, segment),
      snake: this,
      id,
      i,
      head: i == 0,
      tail: i == length - 1
    }));
    
    // update space
    space[0] = width - 1 - head.x;
    space[1] = height - 1 - head.y;
    space[2] = head.x;
    space[3] = head.y;
  }
  function init(snake, game) {
    id = snake.id;
    name = snake.name;
    
    update(snake, game);
  }
  
  function addBody(cellIndex) {
    body.forEach(segment => {
      cellIndex[segment.index] = segment;
    });
  }
  
  Object.defineProperties(this, {
    id: { get: () => id },
    name: { get: () => name },
    health: { get: () => health },
    head: { get: () => head },
    x: { get: () => head.x },
    y: { get: () => head.y },
    tail: { get: () => tail },
    start: { get: () => start },
    end: { get: () => end },
    space: { get: () => space },
    length: { get: () => length },
    body: { get: () => body },
    update: { get: () => update },
    addBody: { get: () => addBody }
  });
}

function Controller(data_0, gorgons) {
  var id;
  
  var width, height, N;
  
  var snakes = [];
  var snakesById = {};
  var you;
  var minSnakeDist;
  
  var food;
  
  var occupiedCells;
  
  var turn;
  
  var states = [];
  var bodies = [];
  var moves = [];
  var recommendations = [];
  
  init(data_0);
  
  function update(data, res) {
    states.push(data);
    bodies.push(data.you.body);
    
    turn = data.turn;
    
    // update snakes
    occupiedCells = {};
    you.update(data.you, data);
    you.addBody(occupiedCells);
    data.board.snakes.forEach(snake => {
      var S = snakesById[snake.id].snake;
      S.update(snake, data);
      var D = snakesById[snake.id].D;
      D.x = S.x - you.x;
      D.y = S.y - you.y;
      snakesById[snake.id].d = Math.abs(D.x) + Math.abs(D.y);
      S.addBody(occupiedCells);
    });
    
    var moveset = {
      right: {weight: 0},
      up: {weight: 0},
      left: {weight: 0},
      down: {weight: 0}
    };
    var shouts = [
      'Look into my eyes!'
    ];
    
    food = data.board.food.map(f => {
      var D = {
        x: f.x - you.x,
        y: f.y - you.y
      };
      var d = Math.abs(D.x) + Math.abs(D.y);
      return {
        x: f.x,
        y: f.y,
        index: cellIndex(width, f),
        D,
        d
      };
    });
    
    var rs = [];
    gorgons.forEach(gorgon => {
      gorgon.recommend(this).forEach(recommendation => {
        let {
          move,
          recommendation: moveState,
          priority,
          shout
        } = recommendation;
        rs.push(recommendation);
        moveset[move].weight += moveState * priority;
        shouts.push(shout);
      });
    });
    recommendations.push(rs);
    
    var decision = Object.keys(moveset).reduce((m,c) => moveset[c].weight > moveset[m].weight ? c : m,'right');
    console.log({
      turn,
      snakeId: you.id,
      rs,
      decision,
      moveset
    });
    
    // store move
    moves.push(decision);
    
    // send response
    res.send({
      "move": decision,
      "shout": shouts[Math.floor(Math.random() * shouts.length)]
    });
  }
  function init(data) {
    //console.log(data);
    
    states.push(data);
    bodies.push(data.you.body);
    
    id = data.game.id;
    
    width = data.board.width;
    height = data.board.height;
    N = width * height;
    
    // create snakes
    occupiedCells = {};
    you = new SnakeState(data.you, data);
    you.addBody(occupiedCells);
    minSnakeDist = N;
    data.board.snakes.forEach(snake => {
      var snakeState = new SnakeState(snake, data);
      var D = {
        x: snakeState.x - you.x,
        y: snakeState.y - you.y
      };
      var d = Math.abs(D.x) + Math.abs(D.y);
      var S = {
        snake: snakeState,
        D,
        d
      };
      snakes.push(S);
      snakesById[snakeState.id] = S;
      minSnakeDist = Math.min(minSnakeDist, d);
      snakeState.addBody(occupiedCells);
    });
    
    turn = data.turn;
  }
  
  function save() {
    
  }
  
  Object.defineProperties(this, {
    id: { get: () => id },
    width: { get: () => width },
    height: { get: () => height },
    snakes: { get: () => snakes },
    snakesById: { get: () => snakesById },
    minSnakeDist: { get: () => minSnakeDist },
    occupiedCells: { get: () => occupiedCells },
    you: { get: () => you },
    food: { get: () => food },
    turn: { get: () => turn },
    update: { get: () => update },
    save: { get: () => save }
  });
}

function Gorgon(name, initializer, updater) {
  var state = {};
  this.initialize = function(gameState) {
    if(initializer)
      initializer.call(state, gameState);
  };
  this.recommend = function(gameState) {
    return updater.call(state, gameState);
  };
  //this.recommend = function() {
  //  console.log(state);
  //  return state.recommendations;
  //};
}
function AvoidWalls(tolerance, safety) {
  Gorgon.call(this, "avoid-wall", undefined, state => {
    let {
      minSnakeDist,
      you: {
        space
      }
    } = state;
    var recommendations = [];
    if(space[0] == 0) recommendations.push({
      move: 'right',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go right! There is a wall!'
    });
    if(space[0] < tolerance && minSnakeDist < safety) {
      recommendations.push({
        move: 'left',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go left! Avoiding the wall!'
      });
      recommendations.push({
        move: 'right',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go right! There is a wall!'
      });
    }
    if(space[1] == 0) recommendations.push({
      move: 'up',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go up! There is a wall!'
    });
    if(space[1] < tolerance && minSnakeDist < safety) {
      recommendations.push({
        move: 'down',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go down! Avoiding the wall!'
      });
      recommendations.push({
        move: 'up',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go up! There is a wall!'
      });
    }
    if(space[2] == 0) recommendations.push({
      move: 'left',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go left! There is a wall!'
    });
    if(space[2] < tolerance && minSnakeDist < safety) {
      recommendations.push({
        move: 'right',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go right! Avoiding the wall!'
      });
      recommendations.push({
        move: 'left',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go left! There is a wall!'
      });
    }
    if(space[3] == 0) recommendations.push({
      move: 'down',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go down! There is a wall!'
    });
    if(space[3] < tolerance && minSnakeDist < safety) {
      recommendations.push({
        move: 'up',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go up! Avoiding the wall!'
      });
      recommendations.push({
        move: 'down',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go down! There is a wall!'
      });
    }
    return recommendations;
  });
}
function AvoidCollision() {
  Gorgon.call(this, "avoid-collision", undefined, state => {
    let {
      width,
      occupiedCells,
      you: { id, start, space }
    } = state;
    var recommendations = [];
    var segment, snake;
    if(space[0] > 0 && occupiedCells[start + 1]) {
      segment = occupiedCells[start + 1];
      snake = segment.snake;
      recommendations.push({
        move: 'right',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MANDATORY,
        shout: `cannot go right! ${segment.id == id ? 'I am' : snake.name + ' is'} in the way!`
      });
    }
    if(space[1] > 0 && occupiedCells[start + width]) {
      segment = occupiedCells[start + width];
      snake = segment.snake;
      recommendations.push({
        move: 'up',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MANDATORY,
        shout: `cannot go up! ${segment.id == id ? 'I am' : snake.name + ' is'} in the way!`
      });
    }
    if(space[2] > 0 && occupiedCells[start - 1]) {
      segment = occupiedCells[start - 1];
      snake = segment.snake;
      recommendations.push({
        move: 'left',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MANDATORY,
        shout: `cannot go left! ${segment.id == id ? 'I am' : snake.name + ' is'} in the way!`
      });
    }
    if(space[3] > 0 && occupiedCells[start - width]) {
      segment = occupiedCells[start - width];
      snake = segment.snake;
      recommendations.push({
        move: 'down',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MANDATORY,
        shout: `cannot go down! ${segment.id == id ? 'I am' : snake.name + ' is'} in the way!`
      });
    }
    return recommendations;
  });
}
function AvoidPredation() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      snakes,
      length
    } = state;
    var recommendations = [];
    snakes.forEach(snake => {
      let { D, d, length: otherlength, snake: {name} } = snake;
      if( d != 2 || otherlength < length) return;
      if(D.x > 0) {
        recommendations.push({
          move: 'right',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH + 5,
          shout: `cannot go right! I might get eaten by ${name}!`
        });
      }
      if(D.x < 0) {
        recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH + 5,
          shout: `cannot go left! I might get eaten by ${name}!`
        });
      }
      if(D.y > 0) {
        recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH + 5,
          shout: `cannot go up! I might get eaten by ${name}!`
        });
      }
      if(D.y < 0) {
        recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH + 5,
          shout: `cannot go down! I might get eaten by ${name}!`
        });
      }
    });
    return recommendations;
  });
}
function AvoidsStarving(k, tolerances) {
  Gorgon.call(this, "avoid-starving", undefined, state => {
    let {
      food,
      width,
      height,
      occupiedCells,
      you: { head, start, health }
    } = state;
    var recommendations = [];
    if(food.length == 0) return [];
    var closest = food.map(f => f);
    closest.sort((a, b) => a.d - b.d);
    if(closest.length > k) closest = closest.slice(0, k);
    
    var disallowed = Object.assign({}, occupiedCells);
    delete disallowed[start];
    var f = closest[0];
    var target = f.index;
    let {path} = Dijkstra(width, height, start, target, disallowed);
    if(path[0] == undefined) return [];
    var dif = path[1] - start;
    var move;
    switch(dif) {
      case -1:
        move = 'left';
        break;
      case 1:
        move = 'right';
        break;
      case -width:
        move = 'down';
        break;
      case width:
        move = 'up';
        break;
      default:
        move = 'right';
    }
    Object.keys(tolerances).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)).some(priority => {
      var tolerance = tolerances[priority];
      priority = parseInt(priority, 10);
      if(health < closest[closest.length - 1].d + tolerance) {
        recommendations.push({
          move,
          start,
          target,
          health,
          head: JSON.stringify(head),
          food: JSON.stringify(f),
          disallowed: Object.keys(disallowed).join(),
          path: path.join(),
          recommendation: MOVE_STATE_RECOMMENDED,
          priority,
          shout: 'searching for food!'
        });
        return true;
      }
      return false;
    });
    return recommendations;
  });
}
function AvoidEntrapment(tolerance) {
  Gorgon.call(this, "avoid-entrapment", undefined, state => {
    let {
      width,
      height,
      occupiedCells,
      head,
      you: {start}
    } = state;
    var recommendations = [];
    var moves = [-1,1,-width,width].map(s => start + s).filter(i => i >= 0 && i < width * height).filter(i => !occupiedCells[i]);
    if(moves.length < 2) return [];
    var partitions = moves.map(i => FloodFill(width, height, i, occupiedCells));
    var sizes = partitions.map(p => p.length);
    var minIndex = sizes.reduce((a, c, i) => c < sizes[a] ? i : a, 0);
    var maxIndex = sizes.reduce((a, c, i) => c > sizes[a] ? i : a, 0);
    
    if(sizes[maxIndex] - sizes[minIndex] == 0) return [];
    moves.forEach((target, i) => {
      var size = sizes[i];
      var move;
      switch(target - start) {
        case -1:
          move = 'left';
          break;
        case 1:
          move = 'right';
          break;
        case -width:
          move = 'down';
          break;
        case width:
          move = 'up';
          break;
        default:
          move = 'right';
      }
      var recommendation, priority;
      if(size < tolerance) {
        recommendation = MOVE_STATE_FORBIDDEN;
        priority = PRIORITY_HIGH + 5;
      }
      else if(i == minIndex) {
        recommendation = MOVE_STATE_FORBIDDEN;
        priority = PRIORITY_LOW + 5;
      }
      else if(i == maxIndex) {
        recommendation = MOVE_STATE_RECOMMENDED;
        priority = PRIORITY_LOW + 5;
      }
      else return;
      recommendations.push({
        move,
        size,
        target,
        head: JSON.stringify(head),
        disallowed: Object.keys(occupiedCells).join(),
        recommendation,
        priority,
        shout: 'avoiding traps!'
      });
    });
    return recommendations;
  });
}
function HuntSmaller() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      width,
      height,
      occupiedCells,
      snakes,
      you: {length, start: source}
    } = state;
    var recommendations = [];
    var disallowed = Object.assign({}, occupiedCells);
    snakes.forEach(snake => {
      let { snake: {start: target, length: otherlength}, d } = snake;
      if( d % 2 == 0 && otherlength < length) {
        delete disallowed[target];
        let {path} = Dijkstra(width, height, source, target, disallowed);
        if(path[0] == undefined) return;
        var dif = path[1] - source;
        var move;
        switch(dif) {
          case -1:
            move = 'left';
            break;
          case 1:
            move = 'right';
            break;
          case -width:
            move = 'down';
            break;
          case width:
            move = 'up';
            break;
          default:
            move = 'right';
        }
        recommendations.push({
          move,
          source,
          target,
          //head: JSON.stringify(head),
          //otherhead: JSON.stringify(otherhead),
          disallowed: Object.keys(disallowed).join(),
          path: path.join(),
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_HIGH,
          shout: `${snake.name}, I am coming for you!`
        });
        disallowed[target] = true;
      }
    });
    return recommendations;
  });
}
function EatPrey() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      snakes,
      you: { length }
    } = state;
    var recommendations = [];
    snakes.forEach(snake => {
      let { snake: {name, length: otherlength}, d, D } = snake;
      if( d != 2 || otherlength >= length) return;
      if(D.x > 0) {
        recommendations.push({
          move: 'right',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${name}!`
        });
      }
      if(D.x < 0) {
        recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${name}!`
        });
      }
      if(D.y > 0) {
        recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${name}!`
        });
      }
      if(D.y < 0) {
        recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${name}!`
        });
      }
    });
    return recommendations;
  });
}

var games = {};

module.exports = function SetupSnake(prefix, cat, app, upload) {
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      //"color" : "#663300",
      //"color": "#111a00",
      "color": "#213300",
      "head": cat ? 'tiger-king' : (true ? "evil" : "fang"),
      "tail": cat ? 'tiger-tail' : "curled",
       "version": "0.2.0"
    });
  });
  
  // creates the GamePartitions object for this game and stores it in games
  app.post(`/${prefix}/start`, function (req, res) {
    var game = new Controller(req.body, [
      new AvoidWalls(2, 8),
      new AvoidCollision(),
      new AvoidPredation(),
      new AvoidsStarving(3, {
        [PRIORITY_LOW]: 100,
        [PRIORITY_MID]: 90,
        [PRIORITY_HIGH]: 70,
        [PRIORITY_MANDATORY]: 10
      }),
      new AvoidEntrapment(10),
      new HuntSmaller(),
      new EatPrey()
    ]);
    
    games[game.id + '_' + game.you.id] = game;
    console.log(`new game: ${game.id}`);
    var ids = Object.keys(games);
    console.log(`# games: ${ids.length}`);
    console.log(`games: ${ids.join(',\n\t')}`);
    
    res.send({
      "ping": "pong"
    });
  });
  
  // updates GamePartitions object and returns weighted random direction to /move
  app.post(`/${prefix}/move`, upload.array(), function (req, res) {
    var state = req.body;
    let {
      game: {id: gameId},
      you: {id: snakeId}
    } = state;
    
    // update game
    var game = games[gameId + '_' + snakeId];
    game.update(state, res);
  });
  
  app.post(`/${prefix}/end`, function (req, res) {
    var state = req.body;
    let {
      game: {id: gameId},
      you: {id: snakeId}
    } = state;
    
    // update game
    var game = games[gameId + '_' + snakeId];
    game.save();
    
    res.send({
      "ping": "pong"
    });
  });
};