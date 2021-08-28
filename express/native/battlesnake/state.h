#ifndef BATTLESNAKE_STATE_H
#define BATTLESNAKE_STATE_H

#include <list>
#include <set>
#include <string>
#include <vector>

#include <napi.h>

class Position;
class ObjectSet;
class Snake;

enum TILE_TYPE {
  TILE_EMPTY = 0,
  TILE_FOOD = 1,
  TILE_HAZARD = 2,
  TILE_SNAKE = 3
};

enum SEGMENT_TYPE {
  SEGMENT_NONE = 0,
  SEGMENT_ENEMY_HEAD = 1,
  SEGMENT_ENEMY_TAIL = 2,
  SEGMENT_ENEMY_BODY = 3,
  SEGMENT_YOU_HEAD = 4,
  SEGMENT_YOU_TAIL = 5,
  SEGMENT_YOU_BODY = 6
};

class Board {
 public:
  Board(unsigned width, unsigned height);
  
  unsigned width() const { return width_; }
  unsigned height() const { return height_; }
  const ObjectSet& food() const { return *food_; }
  const ObjectSet& hazards() const { return *hazards_; }
  std::vector<Snake*>::const_iterator snakesBegin() const { return snakes_.cbegin(); }
  std::vector<Snake*>::const_iterator snakesEnd() const { return snakes_.cend(); }
  
  Position makePosition(unsigned x, unsigned y);
  void addFood(unsigned x, unsigned y);
  void addHazard(unsigned x, unsigned y);
  void addSnake(Snake *snake) { snakes_.push_back(snake); }
 
 private:
  unsigned width_, height_;
  ObjectSet *food_, *hazards_;
  std::vector<Snake*> snakes_;
};

class Position {
 public:
  Position(Board *board, unsigned x, unsigned y) : board_(board), x_(x), y_(y) {}
  
  unsigned x() const { return x_; }
  unsigned y() const { return y_; }
  unsigned index() { return y_ * board_->width() + x_; }
  
 private:
  Board *board_;
  unsigned x_, y_;
};

class ObjectSet {
 public:
  ObjectSet(Board *board) : board_(board) {}
  
  size_t size() const { return objects_.size(); }
  
  void add(unsigned x, unsigned y) {
    auto p = board_->makePosition(x, y);
    objects_.push_back(p);
    index_.insert(p.index());
  }
  std::list<Position>::const_iterator objectsBegin() const { return objects_.cbegin(); }
  std::list<Position>::const_iterator objectsEnd() const { return objects_.cend(); }
  std::set<unsigned>::const_iterator indexBegin() const { return index_.cbegin(); }
  std::set<unsigned>::const_iterator indexEnd() const { return index_.cend(); }
  
 private:
  Board *board_;
  std::list<Position> objects_;
  std::set<unsigned> index_;
};

class Snake : public ObjectSet {
 public:
  Snake(Board *board, std::string id, std::string name) : ObjectSet(board), id_(id), name_(name) {}
  
  std::string id() const { return id_; }
  std::string name() const { return name_; }
  unsigned length() const { return this->size(); }
  unsigned health() const { return health_; }
  unsigned& health() { return health_; }
  
  void addSegment(unsigned x, unsigned y) {
    //body_.push_back(board_->makePosition(x, y));
    this->add(x, y);
  }
  
 private:
  Board *board_;
  std::string id_, name_;
  unsigned health_;
  //std::list<Position> body_;
};

class State {
 public:
  State(std::string id, unsigned width, unsigned height) : id_(id), board_(new Board(width, height)), turn_(0) {}
  
  std::string id() const { return id_; }
  unsigned turn() const { return turn_; }
  unsigned& turn() { return turn_; }
  const Board& board() const { return *board_; }
  Board& board() { return *board_; }
  const Snake& you() const { return *you_; }
  //size_t getSnakeCount();
  
  //void setTurn(unsigned turn) { turn_ = turn; }
  //void incrementTurn() { turn_++; }
  void setYou(Snake *you) { you_ = you; }

 private:
  std::string id_;
  Board *board_;
  unsigned turn_;
  Snake *you_;
};

#endif // BATTLESNAKE_STATE_H