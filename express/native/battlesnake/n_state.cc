#include "n_state.h"

Napi::FunctionReference NState::constructor;

Napi::Object NState::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "NState", {
    InstanceMethod("getId", &NState::GetId),
    InstanceMethod("getTurn", &NState::GetTurn),
    InstanceMethod("getWidth", &NState::GetWidth),
    InstanceMethod("getHeight", &NState::GetHeight),
    InstanceMethod("toJSON", &NState::ToJSON),
    //InstanceMethod("getSnakeCount", &NState::GetSnakeCount),
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("NState", func);
  return exports;
}

Snake *ParseSnake(Board& board, Napi::Object& src) {
  Napi::String id = src.Get("id").As<Napi::String>();
  Napi::String name = src.Get("name").As<Napi::String>();
  Snake *snake = new Snake(&board, id, name);
  
  Napi::Number health = src.Get("health").As<Napi::Number>();
  snake->health() = health.Uint32Value();
  
  Napi::Array body = src.Get("body").As<Napi::Array>();
  for(uint32_t i = 0; i < body.Length(); i++) {
    Napi::Object s = body.Get(std::to_string(i)).As<Napi::Object>();
    snake->addSegment(
      s.Get("x").As<Napi::Number>().Uint32Value(),
      s.Get("y").As<Napi::Number>().Uint32Value()
    );
  }
  
  return snake;
}

NState::NState(const Napi::CallbackInfo& info) : Napi::ObjectWrap<NState>(info)  {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  int length = info.Length();
  
  if (length != 1) {
    Napi::TypeError::New(env, "Only one argument expected").ThrowAsJavaScriptException();
  }
  //if (length == 0) {
  //  Napi::TypeError::New(env, "At least one argument expected").ThrowAsJavaScriptException();
  //}
  //if (length > 2) {
  //  Napi::TypeError::New(env, "No more than two arguments expected").ThrowAsJavaScriptException();
  //}

  if(info[0].IsObject()) {
    Napi::Object state = info[0].As<Napi::Object>();
    
    Napi::Object game = state.Get("game").As<Napi::Object>();
    Napi::Number turn = state.Get("turn").As<Napi::Number>();
    Napi::Object Board = state.Get("board").As<Napi::Object>();
    Napi::Object you = state.Get("you").As<Napi::Object>();
    
    Napi::String id = game.Get("id").As<Napi::String>();
    
    Napi::Number width = Board.Get("width").As<Napi::Number>();
    Napi::Number height = Board.Get("height").As<Napi::Number>();
    Napi::Array snakes = Board.Get("snakes").As<Napi::Array>();
    Napi::Array food = Board.Get("food").As<Napi::Array>();
    Napi::Array hazards = Board.Get("hazards").As<Napi::Array>();
    
    this->state_ = new State(id.Utf8Value(), width.Uint32Value(), height.Uint32Value());
    auto& board = this->state_->board();
    this->state_->turn() = turn.Uint32Value();
    for(uint32_t i = 0; i < food.Length(); i++) {
      Napi::Object f = food.Get(std::to_string(i)).As<Napi::Object>();
      board.addFood(
        f.Get("x").As<Napi::Number>().Uint32Value(),
        f.Get("y").As<Napi::Number>().Uint32Value()
      );
    }
    for(uint32_t i = 0; i < hazards.Length(); i++) {
      Napi::Object h = hazards.Get(std::to_string(i)).As<Napi::Object>();
      board.addHazard(
        h.Get("x").As<Napi::Number>().Uint32Value(),
        h.Get("y").As<Napi::Number>().Uint32Value()
      );
    }
    for(uint32_t i = 0; i < snakes.Length(); i++) {
      Napi::Object s = snakes.Get(std::to_string(i)).As<Napi::Object>();
      board.addSnake(ParseSnake(board, s));
    }
    this->state_->setYou(ParseSnake(board, you));
    
    return;
  }
}

Napi::Value NState::GetId(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::string id = this->state_->id();
  return Napi::String::New(env, id);
}

Napi::Value NState::GetTurn(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  unsigned turn = this->state_->turn();
  return Napi::Number::New(env, turn);
}

Napi::Value NState::GetWidth(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  unsigned width = this->state_->board().width();
  return Napi::Number::New(env, width);
}

Napi::Value NState::GetHeight(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  unsigned height = this->state_->board().height();
  return Napi::Number::New(env, height);
}

void AddObjectSet(Napi::Env& env, Napi::Object& obj, const ObjectSet& set, std::string arrKey, std::string indexKey) {
  Napi::Array arr = Napi::Array::New(env);
  int i = 0;
  for(auto it = set.objectsBegin(); it != set.objectsEnd(); it++) {
    Napi::Object p = Napi::Object::New(env);
    p.Set("x", Napi::Number::New(env, it->x()));
    p.Set("y", Napi::Number::New(env, it->y()));
    arr.Set(std::to_string(i++), p);
  }
  obj.Set(arrKey, arr);
  Napi::Object index = Napi::Object::New(env);
  for(auto it = set.indexBegin(); it != set.indexEnd(); it++) {
    index.Set(std::to_string(*it), Napi::Number::New(env, 1));
  }
  obj.Set(indexKey, index);
}

void StringifySnake(Napi::Env& env, Napi::Object& S, const Snake& snake) {
  S.Set("id", Napi::String::New(env, snake.id()));
  S.Set("name", Napi::String::New(env, snake.name()));
  S.Set("health", Napi::Number::New(env, snake.health()));
  S.Set("length", Napi::Number::New(env, snake.length()));
  AddObjectSet(env, S, snake, "body", "bodyIndex");
}

Napi::Value NState::ToJSON(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  
  Napi::Object json = Napi::Object::New(env);
  
  json.Set("id", Napi::String::New(env, this->state_->id()));
  json.Set("turn", Napi::Number::New(env, this->state_->turn()));
  
  Napi::Object Board = Napi::Object::New(env);
  auto board = this->state_->board();
  
  Board.Set("width", Napi::Number::New(env, board.width()));
  Board.Set("height", Napi::Number::New(env, board.height()));
  
  AddObjectSet(env, Board, board.food(), "food", "foodIndex");
  AddObjectSet(env, Board, board.hazards(), "hazards", "hazardIndex");
  
  Napi::Array Snakes = Napi::Array::New(env);
  int i = 0;
  for(auto it = board.snakesBegin(); it != board.snakesEnd(); it++) {
    Napi::Object s = Napi::Object::New(env);
    StringifySnake(env, s, *(*it));
    Snakes.Set(std::to_string(i++), s);
  }
  Board.Set("snakes", Snakes);
  
  json.Set("board", Board);
  
  Napi::Object You = Napi::Object::New(env);
  StringifySnake(env, You, this->state_->you());
  json.Set("you", You);

  return json;
}