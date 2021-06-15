/**
 * This snake continues the weighted random theme from smarterrandom.
 * This snake adds the following checks:
 *   1. If an opponents head is two moves away from this snake's head, eliminate
 *     intermediate moves.
 *   2. If moves enter two different closed sections, choose the larger one.
 */

const fs = require('fs');
const _ = require('lodash');

const {
  //SnakeState,
  GameState
} = require('./snakes/common.js');

// Store and maintains partitions of the board
function GamePartitions(state) {
  let {
    width,
    height,
    snakes
  } = state;
  
  // stores the data sent by Battlesnake
  var states = [state];
  // stores only the data about this snakes' body
  var bodies = [state.body];
  // stores only the move response sent to Battlesnake
  var moves = [];
  
  // list of partitions of the board
  // There is initially 1 partition for empty space
  // A partition is added for each snake corresponding to the cells taken up by that snake
  // Partitions corresponding to empty space will have an undefined snake field
  // Snake partitions will have the snake's id as the value of the snake field
  var partitions = [
    {
      index: 0,
      snake: undefined,
      size: width * height
    }
  ];
  
  // A map from snake id to the corresponding partition
  var partitionsBySnakeId = {};
  
  // a grid containing every point on the board
  var grid = _.times(height, i => ({
    row: i,
    cells: _.times(width, j => ({
      row: i,
      col: j,
      index: i * width + j,
      partition: 0,
      edge: i == 0 || i == height - 1 || j == 0 || j == width - 1,
      neighbors: i == 0 || i == height - 1 ? (j == 0 || j == width - 1 ? 3 : 5) : (j == 0 || j == width - 1 ? 5 : 8)
    }))
  }));
  
  // a list of cells to check on the next step 
  var keyPoints = [];
  
  // 
  function moveCell(cell, index) {
    let {row, col} = cell;
    var partition = partitions[index];
    if(cell.partition != partition.index) {
      var previous = partitions[cell.partition];
      
      cell.neighbors = 0;
      for(var a = -1; a < 2; a++)
        for(var b = -1; b < 2; b++) {
          if(a == 0 && b == 0) continue;
          var R = grid[row + a];
          if(!R) continue;
          var neighbor = R.cells[col + b];
          if(!neighbor) continue;
          if(neighbor.partition == cell.partition) {
            neighbor.neighbors--;
          }
          if(neighbor.partition == partition.index) {
            neighbor.neighbors++;
            cell.neighbors++;
          }
        }
      
      previous.size--;
      cell.partition = partition.index;
    }
  }
  snakes.forEach((snake, snakeIndex) => {
    let {
      id,
      body
    } = snake;
    body.forEach((segment, segmentIndex) => {
      let {x,y} = segment;
      var cell = grid[y].cells[x];
      var partition = partitions[partitionsBySnakeId[id]];
      if(!partition) {
        partition = {
          index: partitions.length,
          snake: id
        };
        partitionsBySnakeId[id] = partition.index;
        partitions.push(partition);
      }
      if(!cell) {
        console.error(JSON.stringify({
          //state,
          snakeIndex,
          //snake,
          segmentIndex,
          segment,
          x,
          y,
          width,
          height
        }, null, 2));
        return;
      }
      moveCell(cell, partition.index);
    });
    
    var tail = body[body.length - 1];
    let {
      x, y
    } = tail;
    var cell = grid[y].cells[x];
    keyPoints.push(cell);
  });
  
  Object.defineProperties(this, {
    states: { get: () => states, enumerable: true },
    bodies: { get: () => bodies, enumerable: true },
    moves: { get: () => moves, enumerable: true },
    partitions: { get: () => partitions, enumerable: true },
    partitionsBySnakeId: { get: () => partitionsBySnakeId, enumerable: true },
    grid: { get: () => grid, enumerable: true },
    keyPoints: { get: () => keyPoints, enumerable: true },
    moveCell: { get: () => moveCell },
  });
}

var games = {};

module.exports = function SetupSnake(app, upload) {
  const prefix = 'jormungand-0.1.0';
  
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color" : "#ebcf34",
      "head" : "shades",
      "tail" : "bolt",
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
    var game = new GamePartitions(state);
    
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
    var state = new GameState(req.body);
    let {
      gameId,
      snakeId,
      width,
      height,
      snakes,
      head,
      length
    } = state;
    var game = games[gameId + '_' + snakeId];
    game.states.push(state);
    game.bodies.push(state.body);
    if(!head) {
      console.error('head is null');
      console.error(JSON.stringify(req.body.you, null, 2));
      res.send({
        "move": 'right',
        "shout": "I am moving up!"
      });
      return;
    }
    
    //var out = {};
    
    game.keyPoints.forEach(cell => {
      var partition = game.partitions[cell.partition];
      var id = partition.snake;
      var snake = snakes.filter(s => s.id == id)[0];
      if(snake) {
        if(!snake.body.some(s => s.x == cell.col && s.y == cell.row)) {
          var openPartitions = {};
          for(var a = -1; i < 2; a++)
            for(var b = -1; b < 2; b++) {
              if(a == 0 && b == 0) continue;
              var R = game.grid[cell.row + a];
              if(!R) continue;
              var neighbor = R.cells[cell.col + b];
              if(!neighbor) continue;
              var p = game.partitions[neighbor.partition];
              if(p.snake != undefined) openPartitions[p.index] = p;
            }
          var indices = Object.keys(openPartitions);
          if(indices.length == 0) {
            var np = {
              index: game.partitions.length,
              snake: undefined
            };
            game.partitions.push(np);
          }
          else if(indices.length > 1) {}
          else {
            game.moveCell(cell, indices[0]);
          }
        }
      }
    });
    
    var moves = ['right','up','left','down'];
    var space = [
      /* right */ width - head.x - 1,
      /* up */    height - head.y - 1,
      /* left */  head.x,
      /* down */  head.y
    ];
    // Eliminate moves that exit board and increase chance of moving towards center
    var weight = space.map(s => Math.sqrt(s));
    
    // Eliminate moves that collide with a snake (including self)
    snakes.forEach(snake => {
      let { body } = snake;
      body.forEach(segment => {
        var dir = {
          x: head.x - segment.x,
          y: head.y - segment.y
        };
        if( Math.abs(dir.x) + Math.abs(dir.y) != 1) return;
        var from;
        if(dir.x == 1) from = 2;
        if(dir.x == -1) from = 0;
        if(dir.y == 1) from = 3;
        if(dir.y == -1) from = 1;
        weight[from] = 0;
      });
    });
    
    // Eliminate moves that are accessible to opoinents in this turn unless length is greater
    snakes.forEach(snake => {
      let { id, head: otherhead, otherlength } = snake;
      if(id == snakeId) return;
      var dir = {
        x: otherhead.x - head.x,
        y: otherhead.y - head.y
      };
      if( Math.abs(dir.x) + Math.abs(dir.y) != 2 || otherlength < length) return;
      if(dir.x > 0) {
        weight[0] = 0;
      }
      if(dir.x < 0) {
        weight[2] = 0;
      }
      if(dir.y > 0) {
        weight[1] = 0;
      }
      if(dir.y < 0) {
        weight[3] = 0;
      }
    });
    var w = weight.reduce((s,c) => s + c, 0);
    var r = Math.random() * w;
    var i = 0;
    while(r > weight[i]) {
      r -= weight[i];
      i++;
    }
    var move = moves[i];
    game.moves.push(move);
    res.send({
      "move": move,
      "shout": "I am moving up!"
    });
    //console.log(req.body);
    //console.log(Object.keys(req.body));
  });
  
  // writes state objects to file
  app.post(`/${prefix}/end`, function (req, res) {
    var state = new GameState(req.body);
    let {
      gameId,
      snakeId
    } = state;
    var game = games[gameId + '_' + snakeId];
    
    fs.writeFile(`games/${gameId + '_' + snakeId}.json`, JSON.stringify({state, game}, null, 2), 'utf8', err => {
      if(err) {
        console.error(err);
      }
    });
    fs.writeFile(`games/${gameId + '_' + snakeId}_states.json`, JSON.stringify(game.states, null, 2), 'utf8', err => {
      if(err) {
        console.error(err);
      }
    });
    fs.writeFile(`games/${gameId + '_' + snakeId}_bodies.json`, JSON.stringify(game.bodies, null, 2), 'utf8', err => {
      if(err) {
        console.error(err);
      }
    });
    fs.writeFile(`games/${gameId + '_' + snakeId}_moves.json`, JSON.stringify(game.moves, null, 2), 'utf8', err => {
      if(err) {
        console.error(err);
      }
    });
    
    res.send({
      "ping": "pong"
    });
  });
};