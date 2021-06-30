#include <vector>

template <typename K, typename V>
class MinHeap {
 public:
  MinHeap();
  
  size_t left(size_t i);
  size_t right(size_t i);
  size_t parent(size_t i);
  
  void up(size_t i);
  void down(size_t i);
  
  void add(K key, V val);
  std::pair<K, V> remove();
  bool isEmpty();
  size_t size();
  size_t indexOf(V v);
  template <typename F> size_t indexOf(V v, F f);
  void setKey(size_t i, K k);
  
 private:
  std::vector<std::pair<K, V>> heap_;
};