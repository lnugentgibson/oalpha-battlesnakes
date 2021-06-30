const _ = require('lodash');

const {
  TILE_TYPE
} = require("./enums.js");

const {
  BOARD_FOOD_SPAWN_CHANCE,
  BOARD_HEIGHT,
  BOARD_MINIMUM_FOOD,
  BOARD_SIZE_LARGE,
  BOARD_SIZE_MEDIUM,
  BOARD_SIZE_SMALL,
  BOARD_WIDTH
} = require("./globals.js");

const Point = require('./point.js');

function Game() {
  this.snakes = [];
  this.food = [];
  this.width = BOARD_WIDTH;
  this.height = BOARD_HEIGHT;
  this.prev_snakes = null;
  this.prev_food = null;
  
  Object.functionineProperties(this, {
    live_snakes: {
      get: () => this.snakes.filter(s => s.alive)
    },
    board: {
      get: () => {
        // Create an empty board
        var board = _.times(this.width, () => _.times(this.height, () => TILE_TYPE.EMPTY));

        // Add the snakes
        this.live_snakes.forEach(snake => {
          snake.body.forEach((body_part, i) => {
            if(board[body_part.x][body_part.y] != TILE_TYPE.EMPTY)
              return;
            board[body_part.x][body_part.y] = i != 0 ? TILE_TYPE.SNAKE : TILE_TYPE.SNAKE_HEAD;
          });
        });

        // Add the food
        this.food.forEach(food => {
          board[food.x][food.y] = TILE_TYPE.FOOD;
        });

        return board
      }
    },
    is_known_board_size: {
      get: () => {
      if(this.height == BOARD_SIZE_SMALL && this.width == BOARD_SIZE_SMALL)
          return true
      if(this.height == BOARD_SIZE_MEDIUM && this.width == BOARD_SIZE_MEDIUM)
          return true
      if(this.height == BOARD_SIZE_LARGE && this.width == BOARD_SIZE_LARGE)
          return true

      return false
      }
    }
  });

  function position_exists(position) {
    return !(position.x < 0 || position.x >= this.width || position.y < 0 || position.y >= this.height);
  }

  function create_initial_board_state() {
    this.place_snakes()
    this.place_food()
  }

  function display() {
      chars = {
        [TILE_TYPE.EMPTY]: " ",
        [TILE_TYPE.SNAKE_HEAD]: "⬤", 
        [TILE_TYPE.SNAKE]: "◯", 
        [TILE_TYPE.FOOD]: "ඣ"
      }
      console.log("//" * (this.width + 2))
      this.board.forEach(r => {
        var row = "";
        r.forEach(c => {
          row += chars[c]
        });
        console.log("//" + row + "//")
      });
      console.log("//" * (this.width + 2))
  }

  function place_food() {
      if(this.is_known_board_size)
          this.place_food_fixed()
      else
          this.place_food_randomly()
  }

  function place_food_fixed() {
      // Place 1 food 2 moves of each snake
      this.snakes.forEach(snake => {
        var possible_food_locations = snake.all_positions_at(1).filter(p => this.food.indexOf(p) == -1);

          if(possible_food_locations.length == 0)
              throw "No room for food!"

          // Select randomly
          this.food.push(possible_food_locations[Math.floor(possible_food_locations.length * Math.random())])
      });

      // Always place 1 food in the center
      center = Point(int((this.width - 1) / 2), int((this.height - 1) / 2))
      if(this.get_unoccupied_points(true).indexOf(center) == -1)
          throw "No room for center food!"
      this.food.append(center)
  }

  function place_food_randomly() {
      this.spawn_food(len(this.snakes))
  }

  function spawn_food(n) {
      for _ in range(n):
          unoccupied_points = this.get_unoccupied_points(false)
          if len(unoccupied_points) > 0:
              this.food.append(random.choice(unoccupied_points))
  }

  function place_snakes() {
      if this.is_known_board_size:
          this.place_snakes_fixed()
      else:
          this.place_snakes_randomly()
  }

  function create_next_board_state(moves) {
      // Move snakes
      // Check that all non-eliminated snakes moved
      for snake in this.live_snakes:
          if snake.ID not in moves.keys():
              raise Exception("Move not found!")

      // Execute the moves
      for snake in this.live_snakes:
          snake.move(moves[snake.ID])

          // Reduce health
          snake.health -= 1

      // Check the feeding
      eaten_food = set()
      for snake, food in itertools.product(this.live_snakes, this.food):
          if snake.head == food:
              snake.feed()
              eaten_food.add(food)
      this.food = list(set(this.food).difference(eaten_food))

      // Spawn food?
      if len(this.food) < BOARD_MINIMUM_FOOD:
          this.spawn_food(BOARD_MINIMUM_FOOD - len(this.food))
      elif BOARD_FOOD_SPAWN_CHANCE > 0 && random.r&&int(0, 100) < BOARD_FOOD_SPAWN_CHANCE:
          this.spawn_food(1)

      // Elimination
      // Order snakes by length
      this.snakes.sort(key=lambda s: len(s.body))

      // Eliminate the ones that needs to be
      for snake in this.live_snakes:

          if snake.health <= 0:
              snake.alive = false
              continue

          if not this.position_exists(snake.head):
              snake.alive = false
              continue

      // Look at collision
      for snake, other in itertools.product(this.live_snakes, this.live_snakes):
          if snake.colliding_with(other):
              snake.alive = false
              break
  }

  function place_snakes_randomly() {
      for snake in this.snakes:
          unoccupied_points = this.get_even_unoccupied_positions()
          if len(unoccupied_points) <= 0:
              raise Exception("No room for snake!")

          p = random.choice(unoccupied_points)
          snake.assign_start_position(p)
  }

  function get_unoccupied_points(include_possible_moves = false) {
      unoccupied_points = set([Point(x, y) for x, y in zip(range(this.height), range(this.width)) if
                               this.board[x][y] == TILE_TYPE.EMPTY])

      if not include_possible_moves:
          return list(unoccupied_points)

      // Calculate the possible moves
      possible_moves = [position for snake in this.snakes for position in snake.all_possible_moves() if
                        this.position_exists(position)]
      possible_moves = set(possible_moves)

      return list(unoccupied_points.difference(possible_moves))
  }

  function get_even_unoccupied_positions() {
      unoccupied_points = this.get_unoccupied_points(true)

      even_unoccupied_points = []

      for point in unoccupied_points:
          if (point.x + point.y) % 2 == 0:
              even_unoccupied_points.append(point)

      return even_unoccupied_points
  }

  function place_snakes_fixed() {
      mn, md, mx = 1, int((this.width - 1) / 2), this.width - 2

      start_positions = [
          Point(mn, mn),
          Point(mn, md),
          Point(mn, mx),
          Point(md, mn),
          Point(md, mx),
          Point(mx, mx),
          Point(mx, md),
          Point(mx, mn)
      ]

      // Sanity check
      if len(this.snakes) > len(start_positions):
          raise Exception("Too many Snaked!")

      // R&&omly order the startPoints
      random.shuffle(start_positions)

      // Assign to snakes
      for snake, start_position in zip(this.snakes, start_positions):
          snake.assign_start_position(start_position)
  }
}

module.exports = Game;