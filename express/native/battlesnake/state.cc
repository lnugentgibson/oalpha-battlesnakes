#include "state.h"

Board::Board(unsigned width, unsigned height)
  : width_(width),
    height_(height),
    food_(new ObjectSet(this)),
    hazards_(new ObjectSet(this)) {}

Position Board::makePosition(unsigned x, unsigned y) { return Position(this, x, y); }
void Board::addFood(unsigned x, unsigned y) { food_->add(x, y); }
void Board::addHazard(unsigned x, unsigned y) { hazards_->add(x, y); }