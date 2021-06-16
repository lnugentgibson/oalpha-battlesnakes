import copy

from python.game.enums import Direction
from python.game.globals import SNAKE_MAX_HEALTH, SNAKE_STARTER_SIZE
from python.game.Point import Point


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
            new_head.y += 1
        elif direction == Direction.LEFT:
            new_head.x -= 1
        elif direction == Direction.RIGHT:
            new_head.x += 1
        elif direction == Direction.UP:
            new_head.y -= 1
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