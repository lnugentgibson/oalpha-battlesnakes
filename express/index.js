const express = require('express');

const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

const port = 3031;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send('Battlesnake!');
});

// Add random snake
require('./snakes/random.js')(app);
// Add smarterrandom snake
require('./snakes/smarterrandom.js')(app, upload);
// Add smarterrandom snake
require('./snakes/evensmarterrandom.js')(app, upload);
// Add jormungand snake
require('./snakes/jormungand.js')('jormungand-0.1.0', false, app, upload);
require('./snakes/jormungand.js')('jormungand', false, app, upload);
require('./snakes/jormungand.js')('roarmungand', true, app, upload);
// Add hydra snake
require('./snakes/hydra.js')(app, upload);
// Add medusa snake
require('./snakes/medusa.js')('medusa-0.1.0', false, app, upload);
require('./snakes/medusa.js')('medusa', false, app, upload);
require('./snakes/medusa.js')('meowdusa', true, app, upload);
require('./snakes/medusa.js')('medusa-debug', false, app, upload, true);

var server = require('http').createServer(app);
server.listen(port);