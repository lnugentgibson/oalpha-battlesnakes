#include <napi.h>
#include "battlesnake/nstate.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return NState::Init(env, exports);
}

NODE_API_MODULE(battlesnake, InitAll)