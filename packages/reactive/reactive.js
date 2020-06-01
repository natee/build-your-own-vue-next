/**
 * usage
 * const data = reactive({
 *  name: "Bob",
 *  age: 18
 * })
 */

const targetMap = new WeakMap();

function track(target, key) {
  let depsMap = targetMap.get(target)
  if(!depsMap){
    depsMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, dep = new Set());
  }
  dep.add(effect)
}

function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if(depsMap){
    let dep = depsMap.get(key)
    if(dep) {
      dep.forEach(effect => effect())
    }
  }
}

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key)
      return result
    }
    set(target, key, value, receiver) {
      const oldVal = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if(oldVal !== result){
        trigger(target, key)
      }
      return result
    }
  }
  return new Proxy(target, handler)
}
