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