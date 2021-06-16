const tf = require('@tensorflow/tfjs');

function createRandomModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({inputShape: [(2*40+2+1)*6], units: 32, activation: 'relu'}),
      tf.layers.dense({units: 4, activation: 'softmax'})
    ]
  });
  model.weights.forEach(w => {
    const vals = tf.randomNormal(w.shape);
    w.vals.assign(vals);
  });
  return model;
}

function compileModel(model) {
  model.compile({
    optimizer: 'sgd',
    loss: ''
  });
}