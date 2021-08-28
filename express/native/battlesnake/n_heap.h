#include <napi.h>

#include "heap.h"

class NMinHeap : public Napi::ObjectWrap<NMinHeap> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  NMinHeap(const Napi::CallbackInfo& info);
  ~NMinHeap();
  MinHeap<int, int>* GetInternalInstance();
  
 private:
  Napi::Value left(const Napi::CallbackInfo& info);
  Napi::Value right(const Napi::CallbackInfo& info);
  Napi::Value parent(const Napi::CallbackInfo& info);
  
  Napi::Value add(const Napi::CallbackInfo& info);
  Napi::Value remove(const Napi::CallbackInfo& info);
  Napi::Value isEmpty(const Napi::CallbackInfo& info);
  Napi::Value size(const Napi::CallbackInfo& info);
  Napi::Value indexOf(const Napi::CallbackInfo& info);
  // Napi::Value indexOf(V v, F f);
  Napi::Value setKey(const Napi::CallbackInfo& info);

  static Napi::FunctionReference constructor;
  
  MinHeap<int, int> *heap_;
};