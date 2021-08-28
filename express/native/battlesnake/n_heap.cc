#include "n_heap.h"

Napi::FunctionReference NMinHeap::constructor;

Napi::Object NMinHeap::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "NMinHeap", {
    InstanceMethod("left", &NMinHeap::left),
    InstanceMethod("right", &NMinHeap::right),
    InstanceMethod("parent", &NMinHeap::parent),
    InstanceMethod("add", &NMinHeap::add),
    InstanceMethod("remove", &NMinHeap::remove),
    InstanceMethod("isEmpty", &NMinHeap::isEmpty),
    InstanceMethod("size", &NMinHeap::size),
    InstanceMethod("indexOf", &NMinHeap::indexOf),
    InstanceMethod("setKey", &NMinHeap::setKey),
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("NMinHeap", func);
  return exports;
}

NMinHeap::NMinHeap(const Napi::CallbackInfo& info) : Napi::ObjectWrap<NMinHeap>(info) {
  this->heap_ = new MinHeap<int, int>();
}
NMinHeap::~NMinHeap() {
  delete this->heap_;
}
MinHeap<int, int>* NMinHeap::GetInternalInstance() {
  return this->heap_;
}

Napi::Value NMinHeap::left(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, MinHeap<int, Napi::Value>::left(info[0].As<Napi::Number>().Uint32Value()));
}
Napi::Value NMinHeap::right(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, MinHeap<int, Napi::Value>::right(info[0].As<Napi::Number>().Uint32Value()));
}
Napi::Value NMinHeap::parent(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, MinHeap<int, Napi::Value>::parent(info[0].As<Napi::Number>().Uint32Value()));
}

Napi::Value NMinHeap::add(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int key = info[0].As<Napi::Number>().Uint32Value();
  int val = info[1].As<Napi::Number>().Uint32Value();
  this->heap_->add(key, val);
  return Napi::Number::New(env, 1);
}
Napi::Value NMinHeap::remove(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  auto r = Napi::Object::New(env);
  auto ret = this->heap_->remove();
  r.Set("key", Napi::Number::New(env, ret.first));
  r.Set("val", Napi::Number::New(env, ret.second));
  return r;
}
Napi::Value NMinHeap::isEmpty(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Boolean::New(env, this->heap_->isEmpty());
}
Napi::Value NMinHeap::size(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::Number::New(env, this->heap_->size());
}
Napi::Value NMinHeap::indexOf(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int val = info[0].As<Napi::Number>().Uint32Value();
  Napi::Function func = info[1].As<Napi::Function>();
  return Napi::Number::New(env, this->heap_->indexOf(val, [&env, func](int a, int b) {
    std::vector<napi_value> args = {Napi::Number::New(env, a), Napi::Number::New(env, b)};
    return func.Call(args).As<Napi::Boolean>().Value();
  }));
}
Napi::Value NMinHeap::setKey(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int index = info[0].As<Napi::Number>().Uint32Value();
  int key = info[1].As<Napi::Number>().Uint32Value();
  this->heap_->setKey(index, key);
  return Napi::Number::New(env, 1);
  
}
