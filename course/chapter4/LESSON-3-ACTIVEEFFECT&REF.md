# Lesson 3 - activeEffect 和 ref
- [Lesson 3 - activeEffect 和 ref](#lesson-3---activeeffect-和-ref)
  - [只响应需要依赖更新的代码（effect）](#只响应需要依赖更新的代码effect)
    - [现阶段完整代码](#现阶段完整代码)
  - [实现ref](#实现ref)
    - [现阶段完整代码](#现阶段完整代码-1)

首先，我们修改一下示例代码：
```js
let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let effect = () => { timesA = obj.a * 10 }
effect()

console.log(timesA) // 100
obj.a = 100
// 新增一行，使用到obj.a
console.log(obj.a)
console.log(timesA) // 1000
```
由上节知识可以知道，当 `effect` 执行时我们访问到了 `obj.a`，因此会触发 `track` 收集该依赖 `effect`。同理，`console.log(obj.a)` 这一行也同样触发了 `track`，但这并不是响应式代码，我们预期不触发 `track`。

**我们想要的是只在 `effect` 中的代码才触发 `track`**。

能想到怎么来实现吗？

## 只响应需要依赖更新的代码（effect）
首先，我们定义一个变量 `shouldTrack`，**暂且**认为它表示是否需要执行 `track`，我们修改 `track` 代码，只需要增加一层判断条件，如下：

```js
const targetMap = new WeakMap();
let shouldTrack = null
function track(target, key) {
  if(shouldTrack){
    let depsMap = targetMap.get(target)
    if(!depsMap){
      targetMap.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(key)
    if(!dep) {
      depsMap.set(key, dep = new Set());
    }

    // 这里的 effect 为使用时定义的 effect
    // shouldTrack 时应该把对应的 effect 传进来
    dep.add(effect)
    // 如果有多个就手写多个
    // dep.add(effect1)
    // ...
  }
}
```

现在我们需要解决的就是 `shouldTrack` 赋值问题，当有需要响应式变动的地方，我们就写一个 `effect` 并赋值给 `shouldTrack`，然后 `effect` 执行完后重置 `shouldTrack` 为 `null`，这样结合刚才修改的 `track` 函数就解决了这个问题，思路如下：

```js
let shouldTrack = null
// 这里省略 track trigger reactive 代码
...

let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let effect = () => { timesA = obj.a * 10 }
shouldTrack = effect // (*)
effect()
shouldTrack = null // (*)

console.log(timesA) // 100
obj.a = 100
console.log(obj.a)
console.log(timesA) // 1000
```
此时，执行到 `console.log(obj.a)` 时，由于 `shouldTrack` 值为 `null`，所以并不会执行 `track`，完美。 

完美了吗？显然不是，当有很多的 `effect` 时，你的代码会变成下面这样：
```js

let effect1 = () => { timesA = obj.a * 10 }
shouldTrack = effect1 // (*)
effect1()
shouldTrack = null // (*)

let effect2 = () => { timesB = obj.a * 10 }
shouldTrack = effect1 // (*)
effect2()
shouldTrack = null // (*)
```
我们来优化一下这个问题，为了和Vue 3保持一致，这里我们修改 `shouldTrack` 为 `activeEffect`，现在它**表示当前运行的 `effect`**。

我们把这段重复使用的代码封装成函数，如下：
```js
let activeEffect = null
// 这里省略 track trigger reactive 代码
...

function effect(eff) {
  activeEffect = eff
  activeEffect()
  activeEffect = null
}
```

同时我们还需要修改一下 `track` 函数：
```js
function track(target, key) {
  if(activeEffect){
    ...
    // 这里不用再根据条件手动添加不同的 effect 了！
    dep.add(activeEffect)
  }
}
```

那么现在的使用方法就变成了：
```js
const targetMap = new WeakMap();
let activeEffect = null
function effect (eff) { ... }
function track() { ... }
function trigger() { ... }
function reactive() { ... }

let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let timesB = 0
effect(() => { timesA = obj.a * 10 })
effect(() => { timesB = obj.b * 10 })

console.log(timesA) // 100
obj.a = 100
console.log(obj.a)
console.log(timesA) // 1000
```

### 现阶段完整代码
现在新建一个文件`reactive.ts`，内容就是当前实现的完整响应式代码：
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
```

现在我们已经解决了非响应式代码也触发`track`的问题，同时也解决了上节中留下的问题：`track` 函数中的 `effect` 只能手动添加。

接下来我们解决上节中留下的另一个问题：`reactive` 现在只能作用于对象，基本类型变量怎么处理？

## 实现ref
修改 `demo.js` 代码如下：
```js
import { effect, reactive } from "./reactive"

let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let sum = 0
effect(() => { timesA = obj.a * 10 })
effect(() => { sum = timesA + obj.b })

obj.a = 100
console.log(sum) // 期望: 1020
```
这段代码并不能实现预期效果，因为当 `timesA` 正常更新时，我们希望能更新 `sum`（即重新执行 `() => { sum = timesA + obj.b }`），而实际上由于 `timesA` 并不是一个响应式对象，没有 `track` 其依赖，所以这一行代码并不会执行。

那我们如何才能让这段代码正常工作呢？其实我们把基本类型变量包装成一个对象去调用 `reactive` 即可。
看过 `Vue composition API` 的同学可能知道，Vue 3中用一个 `ref` 函数来实现把基本类型变量变成响应式对象，通过 `.value` 获取值，`ref` 返回的就是一个 `reactive` 对象。

实现这样的一个有 `value` 属性的对象有这两种方法：
1. 直接给一个对象添加 `value` 属性
```js
function ref(intialValue) {
  return reactive({
    value: intialValue
  })
}
```
2. 用 `getter` 和 `setter` 来实现
```js
function ref(raw) {
  const r = {
    get value() {
      track(r, 'value')
      return raw
    },
    set value(newVal) {
      raw = newVal
      trigger(r, 'value)
    }
  }
  return r
}
```

现在我们的示例代码修改成：
```js
import { effect, reactive } from "./reactive"

function ref(intialValue) {
  return reactive({
    value: intialValue
  })
}

let obj = reactive({ a: 10, b: 20 })
let timesA = ref(0)
let sum = 0
effect(() => { timesA.value = obj.a * 10 })
effect(() => { sum = timesA.value + obj.b })

// 期望: timesA: 100  sum: 120 实际：timesA: 100  sum: 120
console.log(`timesA: ${timesA.value}  sum: ${sum}`)

obj.a = 100
// 期望: timesA: 1000  sum: 1020 实际：timesA: 1000  sum: 1020
console.log(`timesA: ${timesA}  sum: ${sum}`)
```
增加了 `ref` 处理基本类型变量后，我们的示例代码运行结果符合预期了。至此我们已经解决了遗留问题：`reactive` 只能作用于对象，基本类型变量怎么处理？

Vue 3中的 `ref` 是用**第二种**方法来实现的，现在我们整理一下代码，把 `ref` 放到 `reactive.j` 中。

### 现阶段完整代码
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
      trigger(r, 'value)
    }
  }
  return r
}
```

有同学可能就要问了，为什么不直接用第一种方法实现 `ref`，而是选择了比较复杂的第二种方法呢？
主要有三方面原因：
1. 根据定义，`ref` 应该只有一个公开的属性，即 `value`，如果使用了 `reactive` 你可以给这个变量增加新的属性，这其实就破坏了 `ref` 的设计目的，它应该只用来包装一个内部的 `value` 而不应该作为一个通用的 `reactive` 对象；
2. Vue 3中有一个 `isRef` 函数，用来判断一个对象是 `ref` 对象而不是 `reactive` 对象，这种判断在很多场景都是非常有必要的；
3. 性能方面考虑，Vue 3中的 `reactive` 做的事情远比第二种实现 `ref` 的方法多，比如有各种检查。

消化一下，下回继续～

[上一课 - Proxy 和 Reflect](./LESSON-2-PROXY&REFLECT.md) ｜ [下一课 - Computed](./LESSON-4-COMPUTED.md)
