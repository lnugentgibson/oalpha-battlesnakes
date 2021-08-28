#include <napi.h>
#include "battlesnake/n_state.h"
#include "battlesnake/n_heap.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
    auto e = exports;
    e = NState::Init(env, exports);
    e = NMinHeap::Init(env, exports);
  return e;
}

NODE_API_MODULE(battlesnake, InitAll)