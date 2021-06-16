/**
 * This snake uses a state machine.
 */

//const fs = require('fs');
//const _ = require('lodash');

const MOVES = ['right','up','left','down'];
const PRIORITY_MANDATORY = 0;
const MOVE_STATE_FORBIDDEN = 0;
const MOVE_STATE_RECOMMENDED = 1;

const {
  //SnakeState,
  GameState
} = require('./common.js');
const MinHeap = require("./heap.js");

function Dijkstra(width, height, source, target, disallowed) {
  var N = width * height;
  
  var dist = {
    sid: 0
  };
  var prev = {};

  var queue = new MinHeap();

  for(var i = 0; i < N; i++) {
    if(i != source) {
      dist[i] = N;
    }
    queue.add(N, i);
  }

  while(!queue.isEmpty()) {
    let [d, i] = queue.remove();
    var D = d + 1;
    [-1,1,-width,width].forEach(shift => {
      var I = i + shift;
      if(I < 0 || I >= N) return;
      if(disallowed[I]) return;
      if(D < dist[I]) {
        dist[I] = D;
        prev[I] = i;
        queue.setKey(queue.indexOf(I), D);
      }
    });
    if(i == target) break;
  }
  var path = [target];
  while(target[0] != source) {
    path.splice(0, 0, prev[path[0]]);
  }

  return {dist, prev, path};
}

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
function AvoidWalls() {
  Gorgon.call(this, "avoid-wall", undefined, state => {
    let {
      width,
      height,
      head: {x, y}
    } = state;
    this.recommendations = [];
    if(width - x - 1 == 0) this.recommendations.push({
      move: 'right',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go right! There is a wall!'
    });
    if(height - y - 1 == 0) this.recommendations.push({
      move: 'up',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go up! There is a wall!'
    });
    if(x == 0) this.recommendations.push({
      move: 'left',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go left! There is a wall!'
    });
    if(y == 0) this.recommendations.push({
      move: 'down',
      recommendation: MOVE_STATE_FORBIDDEN,
      priority: PRIORITY_MANDATORY,
      shout: 'cannot go down! There is a wall!'
    });
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
      let { id, head: otherhead, otherlength } = snake;
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
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go right! I might get eaten!'
        });
      }
      if(dir.x < 0) {
        this.recommendations.push({
          move: 'left',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go left! I might get eaten!'
        });
      }
      if(dir.y > 0) {
        this.recommendations.push({
          move: 'up',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go up! I might get eaten!'
        });
      }
      if(dir.y < 0) {
        this.recommendations.push({
          move: 'down',
          recommendation: MOVE_STATE_FORBIDDEN,
          priority: PRIORITY_MANDATORY,
          shout: 'cannot go down! I might get eaten!'
        });
      }
    });
  }, () => (this.recommendations));
}
function cellIndex(width, cell) {
  return cell.y * width + cell.x;
}
function AvoidsStarving(k, tolerance) {
  Gorgon.call(this, "avoid-starving", undefined, state => {
    let {
      head,
      health,
      food,
      snakes,
      width,
      height
    } = state;
    if(food.length == 0) return;
    let {x, y} = head;
    this.recommendations = [];
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
    if(closest[closest.length - 1].d < health + tolerance) {
      var index = cellIndex(width, head);
      let {path} = Dijkstra(width, height, index, cellIndex(width, closest[0]), disallowed);
      var dif = path[1] - index;
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
      }
      this.recommendations.push({
        move,
        recommendation: MOVE_STATE_RECOMMENDED,
        priority: PRIORITY_MANDATORY,
        shout: 'searching for food!'
      });
    }
  }, () => (this.recommendations));
}

var games = {};

module.exports = function SetupSnake(app, upload) {
  const prefix = 'medusa-0.1.0';
  
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color" : "#663300",
      "head" : "fang",
      "tail" : "curled",
       "version" : "0.0.2"
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
        new AvoidWalls(),
        new AvoidCollision(),
        new AvoidPredation(),
        new AvoidsStarving(3, 20)
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
      right: {},
      up: {},
      left: {},
      down: {}
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
        if(priority == PRIORITY_MANDATORY) {
          moves[move].state = moveState;
        }
        shouts.push(shout);
      });
    });
    game.recommendations.push(recommendations);
    
    var decision;
    var moveset = MOVES.filter(move => moves[move].state != MOVE_STATE_FORBIDDEN);
    var rec = moveset.filter(move => moves[move].state == MOVE_STATE_RECOMMENDED);
    if(rec.length > 0) decision = rec[0];
    else decision = moveset[0];
    console.log({
      recommendations,
      decision
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