# Lesson4 - Computed
- [Lesson4 - Computed](#lesson4---computed)
  - [实现computed](#实现computed)
  - [现阶段完整代码](#现阶段完整代码)
  - [Vue 3 源码](#vue-3-源码)

回到上节中最后的示例代码：
```js
import { effect, reactive, ref } from "./reactive"

let obj = reactive({ a: 10, b: 20 })
let timesA = ref(0)
let sum = 0
effect(() => { timesA.value = obj.a * 10 })
effect(() => { sum = timesA.value + obj.b })
```
看到 `timesA` 和 `sum` 两个变量，有同学就会说：“这不就是计算属性吗，不能像Vue 2一样用 `computed` 来表示吗？” 显然是可以的，看过 `Vue composition API` 的同学可能知道，Vue 3中提供了一个 `computed` 函数。

示例代码如果使用 `computed` 将变成这样：
```js
import { effect, reactive, computed } from "./reactive"

let obj = reactive({ a: 10, b: 20 })
let timesA = computed(() => obj.a * 10)
let sum = computed(() => timesA.value + obj.b)
```
现在的问题就是如何实现 `computed` ？

## 实现computed
我们拿 `timesA` 前后的改动来说明，思考一下 `computed` 应该是什么样的？
1. 返回响应式对象，也许是 `ref()`
2. 内部需要执行 `effect` 函数以收集依赖

```js
function computed(getter) {
  const result = ref();
  effect(() => result.value = getter())
  return result
}
```
现在测试一下示例代码：
```js
import { effect, reactive, ref } from "./reactive"

let obj = reactive({ a: 10, b: 20 })
let timesA = computed(() => obj.a * 10)
let sum = computed(() => timesA.value + obj.b)

// 期望: timesA: 1000  sum: 1020 实际：timesA: 1000  sum: 1020
console.log(`timesA: ${timesA.value}  sum: ${sum.value}`)

obj.a = 100
 // 期望: timesA: 1000  sum: 1020
console.log(`timesA: ${timesA.value}  sum: ${sum.value}`)
```
结果符合预期。
这样实现看起来很容易，实际上Vue 3中的 `computed` 支持传入一个 `getter` 函数或传入一个有 `get` 和 `set` 的对象，并且有其它操作，这里我们不做实现，感兴趣可以去看[源码](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/computed.ts)。

## 现阶段完整代码
至此我们已经实现了一个简易版本的响应式库了，完整代码如下：
```js
const targetMap = new WeakMap();
let activeEffect = null
function effect(eff) {
  activeEffect = eff
  activeEffect()
  activeEffect = null
}

function track(target, key) {
  if(activeEffect){
    let depsMap = targetMap.get(target)
    if(!depsMap){
      targetMap.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(key)
    if(!dep) {
      depsMap.set(key, dep = new Set());
    }
    dep.add(activeEffect)
  }
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
    },
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

function ref(raw) {
  const r = {
    get value() {
      track(r, 'value')
      return raw
    },
    set value(newVal) {
      raw = newVal
      trigger(r, 'value')
    }
  }
  return r
}

function computed(getter) {
  const result = ref();
  effect(() => result.value = getter())
  return result
}
```

## Vue 3 源码
我们现在的代码非常简易，有很多细节尚未实现，你都可以在源码中学习到，比如：
- 操作一些内置的属性，如 `Symbol.iterator`、`Array.length` 等触发来 `track` 如何处理
- 嵌套的对象，如何递归响应
- 对象某个 `key` 对应的 `value` 本身是一个 `reactive` 对象，如何处理

[上一课 - activeEffect 和 ref](./LESSON-3-ACTIVEEFFECT&REF.md) 
