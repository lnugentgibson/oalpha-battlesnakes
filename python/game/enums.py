from enum import Enum


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