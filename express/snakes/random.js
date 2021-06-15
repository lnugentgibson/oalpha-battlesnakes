module.exports = function SetupSnake(app) {
  const prefix = 'random';
  
  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function (req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color" : "#ff0000",
      "head" : "pixel",
      "tail" : "pixel",
       "version" : "0.0.1"
    });
  });
  
  // return arbitrary response to /start
  app.post(`/${prefix}/start`, function (req, res) {
    res.send({
      "ping": "pong"
    });
  });
  
  // return random direction to /move
  app.post(`/${prefix}/move`, function (req, res) {
    var moves = ['right','up','left','down'];
    res.send({
      "move": moves[Math.floor(Math.random() * 4)],
      "shout": "I am moving!"
    });
  });
  
  // return arbitrary response to /end
  app.post(`/${prefix}/end`, function (req, res) {
    res.send({
      "ping": "pong"
    });
  });
};