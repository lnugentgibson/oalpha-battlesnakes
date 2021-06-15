/**
 * This snake uses the weighted random from the smarterrandom snake.
 * Additionally, this snake iterates along its own body to rule out moves that
 * will lead to self collision. However, if no moves are valid, the server will
 * respond with an undefined move which will cause the snake to continue
 * staright which will lead to a collision or out of bounds.
 */

module.exports = function SetupSnake(app, upload) {
  const prefix = 'evensmartrandom-0.0.3';
  
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color" : "#4000ff",
      "head" : "pixel",
      "tail" : "pixel",
       "version" : "0.0.2"
    });
  });
  
  // return arbitrary response to /start
  app.post(`/${prefix}/start`, function (req, res) {
    res.send({
      "ping": "pong"
    });
  });
  
  // return weighted random direction to /move
  app.post(`/${prefix}/move`, upload.array(), function (req, res) {
    let {
      //game,
      //turn,
      board,
      you
    } = req.body;
    /*
    let {
      id,
      ruleset,
      timeout
    } = game;
    //*/
    let {
      width,
      height,
      //snakes,
      //food,
      //hazards
    } = board;
    let {
      //id,
      //name,
      //latency,
      //health,
      body,
      head,
      length,
      //shout
    } = you;
    
    var moves = ['right','up','left','down'];
    
    // calculate distance to walls
    var space = [
      /* right */ width - head.x - 1,
      /* up */    height - head.y - 1,
      /* left */  head.x,
      /* down */  head.y
    ];
    
    // initialize weights
    var weight = space.map(s => Math.sqrt(s));
    
    // rule out self colliding moves
    for(var t = 1; t < length; t++) {
      var dir = {
        x: head.x - body[t].x,
        y: head.y - body[t].y
      };
      var from;
      if(dir.x == 0 && dir.y == 1) from = 3;
      else if(dir.x == 0 && dir.y == -1) from = 1;
      else if(dir.y == 0 && dir.x == 1) from = 2;
      else if(dir.y == 0 && dir.x == -1) from = 0;
      // eliminated invalid move by setting weight to 0
      weight[from] = 0;
    }
    
    // claculate sum of weights
    var w = weight.reduce((s,c) => s + c, 0);
    
    // choose move
    var r = Math.random() * w;
    var i = 0;
    while(r > weight[i]) {
      r -= weight[i];
      i++;
    }
    var move = moves[i];
    
    // send response
    res.send({
      "move": move,
      "shout": "I am moving up!"
    });
  });
  
  // return arbitrary response to /end
  app.post(`/${prefix}/end`, function (req, res) {
    res.send({
      "ping": "pong"
    });
  });
};