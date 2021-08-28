#include <napi.h>

#include "state.h"

class NState : public Napi::ObjectWrap<NState> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  NState(const Napi::CallbackInfo& info);
  State* GetInternalInstance();

 private:
  static Napi::FunctionReference constructor;
  Napi::Value GetId(const Napi::CallbackInfo& info);
  Napi::Value GetTurn(const Napi::CallbackInfo& info);
  Napi::Value GetWidth(const Napi::CallbackInfo& info);
  Napi::Value GetHeight(const Napi::CallbackInfo& info);
  Napi::Value ToJSON(const Napi::CallbackInfo& info);
  //Napi::Value GetSnakeCount(const Napi::CallbackInfo& info);
  State *state_;
};