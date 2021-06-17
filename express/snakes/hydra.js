const tf = require('@tensorflow/tfjs');
const _ = require('lodash');

//tf.setBackend('cpu');

const {
  //SnakeState,
  GameState
} = require('./common.js');

const MAX_SNAKES = 1;
const MAX_LENGTH = 3;

function createRandomModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [(2 * MAX_LENGTH + 1 + 1) * MAX_SNAKES + 1 + 1], units: 4, activation: 'sigmoid' }),
      tf.layers.dense({ units: 4, activation: 'sigmoid' })
    ]
  });
  model.weights.forEach((w, i) => {
    console.log(w.shape);
    var vals;
    if (i == 3)
      vals = tf.zeros(w.shape);
    else
      vals = tf.randomNormal(w.shape, 0, 1);
    console.log(vals.dataSync());
    w.val.assign(vals);
  });
  return model;
}

//function compileModel(model) {
//  model.compile({
//    optimizer: 'sgd',
//    loss: ''
//  });
//}

var models = {};

module.exports = function SetupSnake(app) {
  const prefix = 'hydra-0.0.1';

  // respond with snake metadata to root request
  app.get(`/${prefix}/`, function(req, res) {
    res.send({
      "apiversion": "1",
      "author": "oalpha",
      "color": "#333333",
      "head": "caffeine",
      "tail": "mouse",
      "version": "0.0.1"
    });
  });

  // return arbitrary response to /start
  app.post(`/${prefix}/start`, function(req, res) {
    var state = new GameState(req.body);
    let {
      gameId,
      snakeId
    } = state;
    var model = createRandomModel();

    models[gameId + '_' + snakeId] = model;

    res.send({
      "ping": "pong"
    });
  });

  // return random direction to /move
  app.post(`/${prefix}/move`, function(req, res) {
    var state = new GameState(req.body);
    let {
      gameId,
      snakeId,
      turn,
      snakes,
      width,
      height
    } = state;
    var model = models[gameId + '_' + snakeId];

    var input = [1 - Math.pow(1.1, -turn), snakes.length];
    let { body, health } = state;
    input = input.concat([health / 100, body.length / MAX_LENGTH]);
    input = input.concat(_.times(MAX_LENGTH * 2, i => Math.floor(i / 2) < body.length ? (i % 2 > 0 ? body[Math.floor(i / 2)]['y'] / (height - 1) : body[Math.floor(i / 2)]['x'] / (width - 1)) : 0));
    snakes.forEach(s => {
      let { body, health } = s;
      input = input.concat([health / 100, body.length / MAX_LENGTH]);
      input = input.concat(_.times(MAX_LENGTH * 2, i => Math.floor(i / 2) < body.length ? (i % 2 > 0 ? body[Math.floor(i / 2)]['y'] / (height - 1) : body[Math.floor(i / 2)]['x'] / (width - 1)) : 0));
    });
    if (snakes.length < MAX_SNAKES - 1)
      input = input.concat(_.times((2 * MAX_LENGTH + 1 + 1) * ((MAX_LENGTH - 1) - snakes.length), () => 0));

    var moves = ['right', 'up', 'left', 'down'];
    tf.tidy(() => {
      var I = tf.tensor2d([input]);
      var output = model.predict(I);
      output = output.dataSync();
      var i = output.reduce((max, c, j) => c > output[max] ? j : max, 0);
      console.log({
        turn,
        input,
        output,
        i
      });
      res.send({
        "move": moves[i],
        "shout": "I am moving!"
      });
    });
  });

  // return arbitrary response to /end
  app.post(`/${prefix}/end`, function(req, res) {
    res.send({
      "ping": "pong"
    });
  });
};
