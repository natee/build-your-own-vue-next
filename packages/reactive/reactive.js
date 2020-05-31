/**
 * usage
 * const data = reactive({
 *  name: "Bob",
 *  age: 18
 * })
 */

function reactive(target) {

}

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