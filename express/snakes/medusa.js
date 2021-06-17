/**
 * This snake uses a state machine.
 */

//const fs = require('fs');
//const _ = require('lodash');

const MOVES = ['right','up','left','down'];
const PRIORITY_MANDATORY = 1000;
const PRIORITY_HIGH = 8;
const PRIORITY_MID = 2;
const PRIORITY_LOW = 1;
const MOVE_STATE_FORBIDDEN = -1;
const MOVE_STATE_RECOMMENDED = 1;

const {
  //SnakeState,
  GameState,
  Dijkstra,
  FloodFill
} = require('./common.js');

function Gorgon(name, initializer, updater, recommendation) {
  var state = {};
  this.initialize = function(gameState) {
    if(initializer)
      initializer.call(state, gameState);
  };
  this.update = function(gameState) {
    updater.call(state, gameState);
  };
  this.recommend = function() {
    return recommendation.call(state);
  };
}
function AvoidWalls(tolerance, safety) {
  Gorgon.call(this, "avoid-wall", undefined, state => {
    let {
      width,
      height,
      head: {x, y},
      snakes,
      snakeId
    } = state;
    this.recommendations = [];
    var minDist = width * height;
    snakes.forEach(snake => {
      let { id, head: otherhead } = snake;
      if(id == snakeId) return;
      var dir = {
        x: otherhead.x - x,
        y: otherhead.y - y
      };
      minDist = Math.min(minDist, Math.abs(dir.x) + Math.abs(dir.y));
    });
    if(width - x - 1 == 0) this.recommendations.push({
      move: 'right',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go right! There is a wall!'
    });
    if(width - x - 1 < tolerance && minDist < safety) {
      this.recommendations.push({
        move: 'left',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go left! Avoiding the wall!'
      });
      this.recommendations.push({
        move: 'right',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go right! There is a wall!'
      });
    }
    if(height - y - 1 == 0) this.recommendations.push({
      move: 'up',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go up! There is a wall!'
    });
    if(height - y - 1 < tolerance && minDist < safety) {
      this.recommendations.push({
        move: 'down',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go down! Avoiding the wall!'
      });
      this.recommendations.push({
        move: 'up',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go up! There is a wall!'
      });
    }
    if(x == 0) this.recommendations.push({
      move: 'left',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go left! There is a wall!'
    });
    if(x < tolerance && minDist < safety) {
      this.recommendations.push({
        move: 'right',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go right! Avoiding the wall!'
      });
      this.recommendations.push({
        move: 'left',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go left! There is a wall!'
      });
    }
    if(y == 0) this.recommendations.push({
      move: 'down',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go down! There is a wall!'
    });
    if(y < tolerance && minDist < safety) {
      this.recommendations.push({
        move: 'up',
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MID,
        shout: 'go up! Avoiding the wall!'
      });
      this.recommendations.push({
        move: 'down',
        recommendation: MOVE_STATE_FORBIDDEN,
        priority: PRIORITY_MID,
        shout: 'cannot go down! There is a wall!'
      });
    }
  }, () => (this.recommendations));
}
function AvoidCollision() {
  Gorgon.call(this, "avoid-collision", undefined, state => {
    let {
      head: {x, y},
      snakes
    } = state;
    this.recommendations = [];
    snakes.forEach(snake => {
      let { body } = snake;
      body.forEach(segment => {
        var dir = {
          x: x - segment.x,
          y: y - segment.y
        };
        if( Math.abs(dir.x) + Math.abs(dir.y) != 1) return;
        if(dir.x == 1) this.recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go left! There is a snake!'
        });
        if(dir.x == -1) this.recommendations.push({
          move: 'right',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go right! There is a snake!'
        });
        if(dir.y == 1) this.recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go down! There is a snake!'
        });
        if(dir.y == -1) this.recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go up! There is a snake!'
        });
      });
    });
  }, () => (this.recommendations));
}
function AvoidPredation() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      head: {x, y},
      snakes,
      snakeId,
      length
    } = state;
    this.recommendations = [];
    snakes.forEach(snake => {
      let { id, head: otherhead, length: otherlength } = snake;
      if(id == snakeId) return;
      var dir = {
        x: otherhead.x - x,
        y: otherhead.y - y
      };
      if( Math.abs(dir.x) + Math.abs(dir.y) != 2 || otherlength < length) return;
      if(dir.x > 0) {
        this.recommendations.push({
          move: 'right',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH,
          shout: 'cannot go right! I might get eaten!'
        });
      }
      if(dir.x < 0) {
        this.recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH,
          shout: 'cannot go left! I might get eaten!'
        });
      }
      if(dir.y > 0) {
        this.recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH,
          shout: 'cannot go up! I might get eaten!'
        });
      }
      if(dir.y < 0) {
        this.recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_HIGH,
          shout: 'cannot go down! I might get eaten!'
        });
      }
    });
  }, () => (this.recommendations));
}
function cellIndex(width, cell) {
  return cell.y * width + cell.x;
}
function AvoidsStarving(k, tolerances) {
  Gorgon.call(this, "avoid-starving", undefined, state => {
    let {
      head,
      health,
      food,
      snakes,
      width,
      height
    } = state;
    this.recommendations = [];
    if(food.length == 0) return;
    let {x, y} = head;
    var closest = [];
    food.forEach(f => {
      let {
        x: fx,
        y: fy
      } = f;
      var d = Math.abs(x - fx) + Math.abs(y - fy);
      closest.push({f,d});
      closest.sort((a, b) => a.d - b.d);
    });
    if(closest.length > k) closest = closest.slice(0, k);
    
    var disallowed = {};
    snakes.forEach(snake => {
      snake.body.forEach(cell => {
        disallowed[cellIndex(width, cell)] = true;
      });
    });
    var source = cellIndex(width, head);
    delete disallowed[source];
    var f = closest[0].f;
    var target = cellIndex(width, f);
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
    Object.keys(tolerances).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)).some(priority => {
      var tolerance = tolerances[priority];
      priority = parseInt(priority, 10);
      if(health < closest[closest.length - 1].d + tolerance) {
        this.recommendations.push({
          move,
          source,
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
  }, () => (this.recommendations));
}
function AvoidEntrapment(tolerance) {
  Gorgon.call(this, "avoid-entrapment", undefined, state => {
    let {
      width,
      height,
      head,
      snakes
    } = state;
    this.recommendations = [];
    var disallowed = {};
    snakes.forEach(snake => {
      snake.body.forEach(cell => {
        disallowed[cellIndex(width, cell)] = true;
      });
    });
    var index = cellIndex(width, head);
    var moves = [-1,1,-width,width].map(s => index + s).filter(i => i >= 0 && i < width * height).filter(i => !disallowed[i]);
    if(moves.length < 2) return;
    var partitions = moves.map(i => FloodFill(width, height, i, disallowed));
    var sizes = partitions.map(p => p.length);
    var minIndex = sizes.reduce((a, c, i) => c < sizes[a] ? i : a, 0);
    var maxIndex = sizes.reduce((a, c, i) => c > sizes[a] ? i : a, 0);
    
    if(sizes[maxIndex] - sizes[minIndex] == 0) return;
    moves.forEach((target, i) => {
      var size = sizes[i];
      var move;
      switch(target - index) {
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
        priority = PRIORITY_HIGH;
      }
      else if(i == minIndex) {
        recommendation = MOVE_STATE_FORBIDDEN;
        priority = PRIORITY_LOW;
      }
      else if(i == maxIndex) {
        recommendation = MOVE_STATE_RECOMMENDED;
        priority = PRIORITY_LOW;
      }
      else return;
      this.recommendations.push({
        move,
        size,
        target,
        head: JSON.stringify(head),
        disallowed: Object.keys(disallowed).join(),
        recommendation,
        priority,
        shout: 'avoiding traps!'
      });
    });
  }, () => (this.recommendations));
}
function HuntSmaller() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      width,
      height,
      head,
      snakes,
      snakeId,
      length
    } = state;
    let {x, y} = head;
    this.recommendations = [];
    var source = cellIndex(width, head);
    var disallowed = {};
    snakes.forEach(snake => {
      snake.body.forEach(cell => {
        disallowed[cellIndex(width, cell)] = true;
      });
    });
    snakes.forEach(snake => {
      let { id, head: otherhead, length: otherlength } = snake;
      if(id == snakeId) return;
      var dir = {
        x: otherhead.x - x,
        y: otherhead.y - y
      };
      if( dir.x + dir.y % 2 == 0 && otherlength < length) {
        var target = cellIndex(width, otherhead);
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
        this.recommendations.push({
          move,
          source,
          target,
          head: JSON.stringify(head),
          otherhead: JSON.stringify(otherhead),
          disallowed: Object.keys(disallowed).join(),
          path: path.join(),
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_HIGH,
          shout: `hunting ${snake.name}!`
        });
        disallowed[target] = true;
      }
    });
  }, () => (this.recommendations));
}
function EatPrey() {
  Gorgon.call(this, "avoid-predation", undefined, state => {
    let {
      head: {x, y},
      snakes,
      snakeId,
      length
    } = state;
    this.recommendations = [];
    snakes.forEach(snake => {
      let { id, head: otherhead, length: otherlength } = snake;
      if(id == snakeId) return;
      var dir = {
        x: otherhead.x - x,
        y: otherhead.y - y
      };
      if( Math.abs(dir.x) + Math.abs(dir.y) != 2 || otherlength >= length) return;
      if(dir.x > 0) {
        this.recommendations.push({
          move: 'right',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${snake.name}!`
        });
      }
      if(dir.x < 0) {
        this.recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${snake.name}!`
        });
      }
      if(dir.y > 0) {
        this.recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${snake.name}!`
        });
      }
      if(dir.y < 0) {
        this.recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_RECOMMENDED,
          priority: PRIORITY_MANDATORY,
          shout: `die ${snake.name}!`
        });
      }
    });
  }, () => (this.recommendations));
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
    var state = new GameState(req.body);
    let {
      gameId,
      snakeId
    } = state;
    var game = {
      initialState: state,
      states: [],
      bodies: [],
      moves: [],
      gorgons: [
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
      ],
      recommendations: []
    };
    
    games[gameId + '_' + snakeId] = game;
    console.log(`new game: ${gameId}`);
    var ids = Object.keys(games);
    console.log(`# games: ${ids.length}`);
    console.log(`games: ${ids.join(',\n\t')}`);
    
    res.send({
      "ping": "pong"
    });
  });
  
  // updates GamePartitions object and returns weighted random direction to /move
  app.post(`/${prefix}/move`, upload.array(), function (req, res) {
    // parse game state
    var state = new GameState(req.body);
    let {
      turn,
      gameId,
      snakeId
    } = state;
    
    // update game
    var game = games[gameId + '_' + snakeId];
    game.states.push(state);
    game.bodies.push(state.body);
    
    game.gorgons.forEach(gorgon => {
      gorgon.update(state);
    });
    
    var moves = {
      right: {weight: 0},
      up: {weight: 0},
      left: {weight: 0},
      down: {weight: 0}
    };
    var shouts = [
      'Look into my eyes!'
    ];
    var recommendations = [];
    game.gorgons.forEach(gorgon => {
      gorgon.recommend().forEach(recommendation => {
        let {
          move,
          recommendation: moveState,
          priority,
          shout
        } = recommendation;
        recommendations.push(recommendation);
        moves[move].weight += moveState * priority;
        //if(priority == PRIORITY_MANDATORY) {
        //  moves[move].state = moveState;
        //}
        shouts.push(shout);
      });
    });
    game.recommendations.push(recommendations);
    
    var decision = Object.keys(moves).reduce((m,c) => moves[c].weight > moves[m].weight ? c : m,'right');
    //var moveset = MOVES.filter(move => moves[move].state != MOVE_STATE_FORBIDDEN);
    //var rec = moveset.filter(move => moves[move].state == MOVE_STATE_RECOMMENDED);
    //if(rec.length > 0) decision = rec[0];
    //else decision = moveset[0];
    console.log({
      turn,
      snakeId,
      recommendations,
      decision,
      moves
    });
    
    // store move
    game.moves.push(decision);
    
    // send response
    res.send({
      "move": decision,
      "shout": shouts[Math.floor(Math.random() * shouts.length)]
    });
  });
  
  app.post(`/${prefix}/end`, function (req, res) {
    // parse game state
    //var state = new GameState(req.body);
    //let {
    //  gameId,
    //  snakeId
    //} = state;
    
    //var game = games[gameId + '_' + snakeId];
    //console.log(JSON.stringify(game.recommendations, null, 2));
    
    res.send({
      "ping": "pong"
    });
  });
};