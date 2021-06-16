function SnakeState(data) {
  let {
    id,
    name,
    latency,
    health,
    body,
    head,
    length,
    shout
  } = data;
  Object.defineProperties(this, {
    id: { get: () => id, enumerable: true },
    name: { get: () => name, enumerable: true },
    latency: { get: () => latency, enumerable: true },
    health: { get: () => health, enumerable: true },
    body: { get: () => body, enumerable: true },
    //body: { get: () => (i => body[i]) },
    head: { get: () => head, enumerable: true },
    length: { get: () => length, enumerable: true },
    shout: { get: () => shout, enumerable: true },
  });
}
function GameState(data) {
  let {
    game: {
      id: gameId,
      ruleset,
      timeout
    },
    turn,
    board: {
      width,
      height,
      food,
      hazards
    }
  } = data;
  var snakes = data.board.snakes.map(s => new SnakeState(s));
  var you = new SnakeState(data.you);
  Object.defineProperties(this, {
    gameId: { get: () => gameId, enumerable: true },
    ruleset: { get: () => ruleset, enumerable: true },
    timeout: { get: () => timeout, enumerable: true },
    turn: { get: () => turn, enumerable: true },
    width: { get: () => width, enumerable: true },
    height: { get: () => height, enumerable: true },
    snakes: { get: () => snakes, enumerable: true },
    food: { get: () => food, enumerable: true },
    hazard: { get: () => (i => hazards[i]), enumerable: true },
    you: { get: () => you, enumerable: true },
    snakeId: { get: () => you.id, enumerable: true },
    name: { get: () => you.name, enumerable: true },
    latency: { get: () => you.latency, enumerable: true },
    health: { get: () => you.health, enumerable: true },
    body: { get: () => you.body, enumerable: true },
    head: { get: () => you.head, enumerable: true },
    length: { get: () => you.length, enumerable: true },
    shout: { get: () => you.shout, enumerable: true },
  });
}

module.exports = {
  SnakeState,
  GameState
};