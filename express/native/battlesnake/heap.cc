#include "heap.h"

template <typename K, typename V>
size_t MinHeap<K, V>::left(size_t i) {
  return 2 * (i + 1) - 1;
}
template <typename K, typename V>
size_t MinHeap<K, V>::right(size_t i) {
  return 2 * (i + 1);
}
template <typename K, typename V>
size_t MinHeap<K, V>::parent(size_t i) {
  return ::floor((i + 1) / 2) - 1;
}

template <typename K, typename V>
void MinHeap<K, V>::up(size_t i) {
  K c = heap[i].first;
  size_t j = parent(i);
  while(j >= 0) {
    K p = heap[j].first;
    if(c < p) {
      auto t = heap[i];
      heap[i] = heap[j];
      heap[j] = t;
    }
    else return;
    i = j;
    j = parent(i);
  }
}
template <typename K, typename V>
void MinHeap<K, V>::down(size_t i) {
  K p = heap[i].first;
  size_t j = left(i);
  while(j < heap.size()) {
    K c = heap[j].first;
    if(c < p) {
      auto t = heap[i];
      heap[i] = heap[j];
      heap[j] = t;
      i = j;
    }
    else {
      size_t k = right(i);
      if(k >= heap.size()) return;
      c = heap[k].first;
      if(c < p) {
        auto t = heap[i];
        heap[i] = heap[k];
        heap[k] = t;
        i = k;
      }
      else return;
    }
    j = left(i);
  }
}

template <typename K, typename V>
void MinHeap<K, V>::add(K key, V val) {
  heap.push_back([key, val]);
  up(heap.length - 1);
}
template <typename K, typename V>
std::pair<K, V> MinHeap<K, V>::remove() {
  auto t = heap[0];
  heap[0] = heap[heap.length - 1];
  heap.pop_back();
  if(!heap.isEmpty())
    down(0);
  return t;
}
template <typename K, typename V>
bool MinHeap<K, V>::isEmpty() {
  return heap.isEmpty();
}
template <typename K, typename V>
size_t MinHeap<K, V>::size() {
  return heap.size();
}
template <typename K, typename V>
long MinHeap<K, V>::indexOf(V v) {
  size_t i, j;
  if(std::any_of(heap, [](const std::pair<K, V>& e) {
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
  if(std::any_of(heap, [](const std::pair<K, V>& e) {
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
  heap[i].first = k;
  up(i);
  down(i);
}