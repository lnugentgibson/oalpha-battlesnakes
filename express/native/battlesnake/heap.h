#ifndef BATTLESNAKE_HEAP_H
#define BATTLESNAKE_HEAP_H

#include <vector>
#include <cmath>

template <typename K, typename V>
class MinHeap {
 public:
  MinHeap() {}
  
  static size_t left(size_t i);
  static size_t right(size_t i);
  static long parent(size_t i);
  
  void up(size_t i);
  void down(size_t i);
  
  bool isEmpty() const;
  size_t size() const;
  long indexOf(V v);
  template <typename F> long indexOf(V v, F f);
  
  void add(K key, V val);
  std::pair<K, V> remove();
  void setKey(size_t i, K k);
  
 private:
  std::vector<std::pair<K, V>> heap_;
};

template <typename K, typename V>
size_t MinHeap<K, V>::left(size_t i) {
  return 2 * (i + 1) - 1;
}
template <typename K, typename V>
size_t MinHeap<K, V>::right(size_t i) {
  return 2 * (i + 1);
}
template <typename K, typename V>
long MinHeap<K, V>::parent(size_t i) {
  return (i + 1) / 2 - 1;
}

template <typename K, typename V>
void MinHeap<K, V>::up(size_t i) {
  if(i >= heap_.size()) return;
  K c = heap_[i].first;
  long j = parent(i);
  while(j >= 0) {
    K p = heap_[j].first;
    if(c < p) {
      auto t = heap_[i];
      heap_[i] = heap_[j];
      heap_[j] = t;
    }
    else return;
    i = j;
    j = parent(i);
  }
}
template <typename K, typename V>
void MinHeap<K, V>::down(size_t i) {
  K p = heap_[i].first;
  size_t j = left(i), k = right(i);
  while(j < heap_.size()) {
    K c = heap_[j].first;
    if(c < p) {
      if(k < heap_.size() && heap_[k].first < c) {
        j = k;
      }
      auto t = heap_[i];
      heap_[i] = heap_[j];
      heap_[j] = t;
      i = j;
    }
    else {
      if(k >= heap_.size()) return;
      c = heap_[k].first;
      if(c < p) {
        auto t = heap_[i];
        heap_[i] = heap_[k];
        heap_[k] = t;
        i = k;
      }
      else return;
    }
    j = left(i);
  }
}

template <typename K, typename V>
void MinHeap<K, V>::add(K key, V val) {
  heap_.push_back({key, val});
  up(heap_.size() - 1);
}
template <typename K, typename V>
std::pair<K, V> MinHeap<K, V>::remove() {
  auto t = heap_[0];
  heap_[0] = heap_[heap_.size() - 1];
  heap_.pop_back();
  if(!heap_.empty())
    down(0);
  return t;
}
template <typename K, typename V>
bool MinHeap<K, V>::isEmpty() const {
  return heap_.empty();
}
template <typename K, typename V>
size_t MinHeap<K, V>::size() const {
  return heap_.size();
}
template <typename K, typename V>
long MinHeap<K, V>::indexOf(V v) {
  size_t i, j;
  if(std::any_of(heap_.begin(), heap_.end(), [v, &i, &j](const std::pair<K, V>& e) {
    bool o = false;
    if(e.second == v) {
      i = j;
      o = true;
    }
    j++;
    return o;
  })) return i;
  return -1;
}
template <typename K, typename V>
template <typename F>
long MinHeap<K, V>::indexOf(V v, F f) {
  size_t i, j;
  if(std::any_of(heap_.begin(), heap_.end(), [v, f, &i, &j](const std::pair<K, V>& e) {
    bool o = false;
    if(f(v, e.second)) {
      i = j;
      o = true;
    }
    j++;
    return o;
  })) return i;
  return -1;
}
template <typename K, typename V>
void MinHeap<K, V>::setKey(size_t i, K k) {
  heap_[i].first = k;
  up(i);
  down(i);
}

#endif // BATTLESNAKE_HEAP_H