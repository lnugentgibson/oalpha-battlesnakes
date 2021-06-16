/**
 * This snake moves randomly but weights each direction.
 * The square root of the distance to the wall in each direction is use as the
 * weight which prevents the snake from running out of bounds.
 */

module.exports = function SetupSnake(app, upload) {
  const prefix = 'smartrandom-0.0.2';
  
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color" : "#8000ff",
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
    
    var out = {
      head,
      length,
      body
    };
    
    var moves = ['right','up','left','down'];
    var space = out.space = [
      /* right */ width - head.x - 1,
      /* up */    height - head.y - 1,
      /* left */  head.x,
      /* down */  head.y
    ];
    var weight = out.weight = space.map(s => Math.sqrt(s));
    if(length > 1) {
      var dir = {
        x: head.x - body[1].x,
        y: head.y - body[1].y
      };
      var from;
      if(dir.x == 0 && dir.y == 1) from = 3;
      if(dir.x == 0 && dir.y == -1) from = 1;
      if(dir.y == 0 && dir.x == 1) from = 2;
      if(dir.y == 0 && dir.x == -1) from = 0;
      weight[from] = 0;
      out.fromIndex = from;
      out.from = moves[from];
    }
    var w = out.w = weight.reduce((s,c) => s + c, 0);
    var r = out.r = Math.random() * w;
    var i = 0;
    while(r > weight[i]) {
      r -= weight[i];
      i++;
    }
    out.i = i;
    out.move = moves[i];
    console.log(JSON.stringify(out, null, 2));
    res.send({
      "move": out.move,
      "shout": "I am moving up!"
    });
    //console.log(req.body);
    //console.log(Object.keys(req.body));
  });
  
  // return arbitrary response to /end
  app.post(`/${prefix}/end`, function (req, res) {
    res.send({
      "ping": "pong"
    });
  });
};