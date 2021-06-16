import copy
import itertools
import json
import os
import random
from enum import Enum

import cherrypy

SNAKE_MAX_HEALTH = 100
SNAKE_STARTER_SIZE = 3
BOARD_WIDTH = 7
BOARD_HEIGHT = 7
BOARD_SIZE_SMALL = 7
BOARD_SIZE_MEDIUM = 11
BOARD_SIZE_LARGE = 19
BOARD_FOOD_SPAWN_CHANCE = 15
BOARD_MINIMUM_FOOD = 1




class Tile(Enum):
    EMPTY = 0
    SNAKE = 1
    SNAKE_HEAD = 3
    FOOD = 2


class Direction(Enum):
    UP = 0
    LEFT = 1
    DOWN = 2
    RIGHT = 3
    NONE = 4



class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return other.x == self.x and other.y == self.y

    def __repr__(self):
        return f"Point({self.x},{self.y})"

    def __hash__(self):
        return hash(str(self))


class Snake:
    def __init__(self, ID):
        self.health = SNAKE_MAX_HEALTH
        self.body = []
        self.name = ""
        self.ID = ID
        self.size = SNAKE_STARTER_SIZE
        self.alive = True

    def assign_start_position(self, start_position: Point):
        for _ in range(self.size):
            self.body.append(start_position)

    @property
    def head(self) -> Point:
        return self.body[0]

    def all_possible_moves(self):
        if not self.body:
            return []

        return [
            Point(self.head.x - 1, self.head.y),
            Point(self.head.x + 1, self.head.y),
            Point(self.head.x, self.head.y - 1),
            Point(self.head.x, self.head.y + 1),
        ]

    def all_positions_at(self, distance: int):
        return [
            Point(self.head.x - distance, self.head.y - distance),
            Point(self.head.x + distance, self.head.y + distance),
            Point(self.head.x - distance, self.head.y - 1 + distance),
            Point(self.head.x + distance, self.head.y + 1 - distance),
        ]

    def move(self, direction: Direction):
        new_head = copy.deepcopy(self.head)
        if direction == Direction.DOWN:
            new_head.y -= 1
        elif direction == Direction.LEFT:
            new_head.x -= 1
        elif direction == Direction.RIGHT:
            new_head.x += 1
        elif direction == Direction.UP:
            new_head.y += 1
        else:
            dx = self.body[0].x - self.body[1].x
            dy = self.body[0].y - self.body[1].y
            if dx == 0 and dy == 0:
                dy = 1
            new_head.x += dx
            new_head.y += dy

        self.body.insert(0, new_head)
        self.body.pop()

    def feed(self):
        self.health = SNAKE_MAX_HEALTH
        self.body.append(self.body[-1])

    def colliding_with(self, snake):
        for body_part in snake.body:
            if body_part == snake.head:
                continue

            if body_part == self.head:
                return True
        return False


class Game:
    def __init__(self):
        self.snakes = []
        self.food = []
        self.width = BOARD_WIDTH
        self.height = BOARD_HEIGHT
        self.prev_snakes = None
        self.prev_food = None

    @property
    def live_snakes(self):
        return [s for s in self.snakes if s.alive]

    @property
    def board(self):
        # Create an empty board
        board = [[Tile.EMPTY for _ in range(self.width)] for _ in range(self.height)]

        # Add the snakes
        for snake in self.live_snakes:
            for i, body_part in enumerate(snake.body):
                if board[body_part.x][body_part.y] != Tile.EMPTY:
                    continue
                board[body_part.x][body_part.y] = Tile.SNAKE if i != 0 else Tile.SNAKE_HEAD

        # Add the food
        for food in self.food:
            board[food.x][food.y] = Tile.FOOD

        return board

    def position_exists(self, position: Point):
        return False if position.x < 0 or position.x >= self.width or position.y < 0 or position.y >= self.height else True

    def create_initial_board_state(self):
        self.place_snakes()
        self.place_food()

    def display(self):
        chars = {Tile.EMPTY: " ", Tile.SNAKE_HEAD: "⬤", Tile.SNAKE: "◯", Tile.FOOD: "ඣ"}
        print("#" * (self.width + 2))
        for r in self.board:
            row = ""
            for c in r:
                row += chars[c]

            print("#" + row + "#")
        print("#" * (self.width + 2))

    def place_food(self):
        if self.isKnownBoardSize:
            self.place_food_fixed()
        else:
            self.place_food_randomly()

    def place_food_fixed(self):
        # Place 1 food 2 moves of each snake
        for snake in self.snakes:
            possible_food_locations = [p for p in snake.all_positions_at(1) if p not in self.food]

            if len(possible_food_locations) == 0:
                raise Exception("No room for food!")

            # Select randomly
            self.food.append(random.choice(possible_food_locations))

        # Always place 1 food in the center
        center = Point(int((self.width - 1) / 2), int((self.height - 1) / 2))
        if center not in self.get_unoccupied_points(True):
            raise Exception("No room for center food!")
        self.food.append(center)

    def place_food_randomly(self):
        self.spawn_food(len(self.snakes))

    def spawn_food(self, n: int):
        for _ in range(n):
            unoccupied_points = self.get_unoccupied_points(False)
            if len(unoccupied_points) > 0:
                self.food.append(random.choice(unoccupied_points))

    def place_snakes(self):
        if self.isKnownBoardSize:
            self.place_snakes_fixed()
        else:
            self.place_snakes_randomly()

    @property
    def isKnownBoardSize(self):
        if self.height == BOARD_SIZE_SMALL and self.width == BOARD_SIZE_SMALL:
            return True
        if self.height == BOARD_SIZE_MEDIUM and self.width == BOARD_SIZE_MEDIUM:
            return True
        if self.height == BOARD_SIZE_LARGE and self.width == BOARD_SIZE_LARGE:
            return True

        return False

    def save(self):
        self.prev_food = copy.deepcopy(self.food)
        self.prev_snakes = copy.deepcopy(self.prev_snakes)

    def restore(self):
        self.snakes = copy.deepcopy(self.prev_snakes)
        self.food = copy.deepcopy(self.prev_food)

    def create_next_board_state(self, moves):
        self.save()

        # Move snakes
        # Check that all non-eliminated snakes moved
        for snake in self.live_snakes:
            if not snake.ID in moves.keys():
                raise Exception("Move not found!")

        # Execute the moves
        for snake in self.live_snakes:
            snake.move(moves[snake.ID])

            # Reduce health
            snake.health -= 1

        # Check the feeding
        self.eaten_food = set()
        for snake, food in itertools.product(self.live_snakes, self.food):
            if snake.head == food:
                snake.feed()
                self.eaten_food.add(food)
        self.food = list(set(self.food).difference(self.eaten_food))

        # Spawn food?
        if len(self.food) < BOARD_MINIMUM_FOOD:
            self.spawn_food(BOARD_MINIMUM_FOOD - len(self.food))
        elif BOARD_FOOD_SPAWN_CHANCE > 0 and random.randint(0, 100) < BOARD_FOOD_SPAWN_CHANCE:
            self.spawn_food(1)

        # Elimination
        # Order snakes by length
        self.snakes.sort(key=lambda s: len(s.body))

        # Eliminate the ones that needs to be
        for snake in self.live_snakes:

            if snake.health <= 0:
                snake.alive = False
                continue

            if not self.position_exists(snake.head):
                snake.alive = False
                continue

        # Look at collision
        for snake, other in itertools.product(self.live_snakes, self.live_snakes):
            if snake.colliding_with(other):
                snake.alive = False
                break

    def place_snakes_randomly(self):
        for snake in self.snakes:
            unoccupied_points = self.get_even_unoccupied_positions()
            if len(unoccupied_points) <= 0:
                raise Exception("No room for snake!")

            p = random.choice(unoccupied_points)
            snake.assign_start_position(p)

    def get_unoccupied_points(self, include_possible_moves: bool = False):
        unoccupied_points = set([Point(x, y) for x, y in zip(range(self.height), range(self.width)) if
                                 self.board[x][y] == Tile.EMPTY])

        if not include_possible_moves:
            return list(unoccupied_points)

        # Calculate the possible moves
        possible_moves = [position for snake in self.snakes for position in snake.all_possible_moves() if
                          self.position_exists(position)]
        possible_moves = set(possible_moves)

        return list(unoccupied_points.difference(possible_moves))

    def get_even_unoccupied_positions(self):
        unoccupied_points = self.get_unoccupied_points(True)

        even_unoccupied_points = []

        for point in unoccupied_points:
            if (point.x + point.y) % 2 == 0:
                even_unoccupied_points.append(point)

        return even_unoccupied_points

    def place_snakes_fixed(self):
        mn, md, mx = 1, int((self.width - 1) / 2), self.width - 2

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

        # Sanity check
        if len(self.snakes) > len(start_positions):
            raise Exception("Too many Snaked!")

        # Randomly order the startPoints
        random.shuffle(start_positions)

        # Assign to snakes
        for snake, start_position in zip(self.snakes, start_positions):
            snake.assign_start_position(start_position)



PUBLIC_ENUMS = {
    'Direction': Direction,
    'Tile': Tile,
}
class EnumEncoder(json.JSONEncoder):
    def default(self, obj):
        if type(obj) in PUBLIC_ENUMS.values():
            return obj.value
        return json.JSONEncoder.default(self, obj)


b = Game()
b.snakes.append(Snake("1"))
b.snakes.append(Snake("2"))
b.create_initial_board_state()

import cherrypy_cors


class BattlesnakeGame(object):
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def index(self):
        cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
        b.display()
        b.create_next_board_state({"1": Direction.UP, "2": Direction.LEFT})
        return {
            "board": json.dumps(b.board, cls=EnumEncoder)
        }




if __name__ == "__main__":
    server = BattlesnakeGame()
    cherrypy_cors.install()
    cherrypy.config.update({
        'server.socket_host': '127.0.0.1',
        'server.socket_port': 8080,
        'cors.expose.on': True,
    })

    cherrypy.quickstart(server)


