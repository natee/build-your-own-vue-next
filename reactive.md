# Vue 3 响应式原理

了解Vue 3的底层原理

## Lesson 1 - 实现响应式

### 响应基本变量

首先看一下响应式预期应该是什么样的
```js
// 这种写成一行完全是为了节省空间，实际上我会一行一个变量
let a = 1, b = 2, c = a * b
console.log('c:' + c) // 2
a = 2
console.log('c:' + c) // 期望得到4
```

思考一下，如何才能做到当 `a` 变动时 `c` 跟着变化？

显然，我们需要做的就是重新执行一下 `let c = a * b` 即可。

那么，现在我们把需要重新执行的代码写成一个函数，代码如下：
```js
let a = 1, b = 2, c = 0
let effect = () => { c = a * b }
effect() // 首次执行更新c的值
console.log('c:' + c) // 2
a = 2
console.log('c:' + c) // 期望得到4
```

现在仍然没有达成预期的效果，实际上我们还需要两个方法，一个用来存储所有需要依赖更新的 `effect`，我们假设叫 `track`，一个用来触发执行这些 `effect` 函数，假设叫做 `trigger`。

**注意：** 这里我们的函数命名和 Vue 3 中保持一致，从而可以更容易理解 Vue 3 源码。

代码类似这样：
```js
let a = 1, b = 2, c = 0
let effect = () => { c = a * b }

track() // 收集 effect 
effect() // 首次执行更新c的值
console.log('c:' + c) // 2
a = 2
trigger() // a变化时，触发effect的执行
console.log('c:' + c) // 期望得到4
```

那么 `track` 和 `trigger` 分别做了什么，是如何实现的呢？我们暂且可以简单理解为一个“发布-订阅者模式”，`track` 就是不断给一个数组 `dep` 添加 `effect`，`trigger` 用来遍历执行 `dep` 的每一项 `effect`。

现在来完成这两个函数

```js
let a = 1, b = 2, c = 0
let effect = () => { c = a * b }

let dep = new Set()
let track = () => { dep.add(effect) }
let trigger = () => { dep.forEach(effect => effect()) }

track()
effect() // 首次执行更新c的值
console.log('c:' + c) // 2
a = 2
trigger() // a变化时，触发effect的执行
console.log('c:' + c) // 期望得到4，实际得到4
```
注意这里我们使用 `Set` 来定义 `dep`，原因就是 `Set` 本身不能添加重复的 `key`，读写都非常方便。

现在代码的执行结果已经符合预期了。
```console
c: 2
c: 4
```

### 响应对象的不同属性

通常情况，我们定义的对象都有很多的属性，每一个属性都需要有自己的 `dep`（即每个属性都需要把那些依赖了自己的effect记录下来放进自己的 `new Set()` 中），如何来实现这样的功能呢？

有一段代码如下：
```js
let obj = { a: 10, b: 20 }
let timesA = obj.a * 10
let divideA = obj.a / 10
let timesB = obj.b * 10
let divideB = obj.b / 10

// 100, 1, 200, 2
console.log(`${timesA}, ${divideA}, ${timesB}, ${divideB}`)
obj.a = 100
obj.b = 200
// 期望得到 1000, 10, 2000, 20
console.log(`${timesA}, ${divideA}, ${timesB}, ${divideB}`)
```
这段代码中，按照上文讲解的，属性`a`和`b`的`dep`应该是如下：
```js
let depA = [
  () => { timesA = obj.a * 10 },
  () => { divideA = obj.a / 10 }
]
let depB = [ 
  () => { timesB = obj.b * 10 },
  () => { divideB = obj.b / 10 }
]
```

如果代码还是按照前文的方式来写显然是不科学的，这里就要开始做一点点抽象了，收集依赖我们可以假想用`track('a')` `track('b')`这种形式分别记录对象不同`key`的依赖项，那么显然我们还需要一个东西来存放这些 `key` 及相应的`dep`。

现在我们来实现这样的 `track` 函数及对应的 `trigger` 函数，代码如下：

```js
const depsMap = new Map() // 每一项都是一个 Set 对象
function track(key) {
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, dep = new Set());
  }
  dep.add(effect)
}

function trigger(key) {
  let dep = depsMap.get(key)
  if(dep) {
    dep.forEach(effect => effect())
  }
}
```
这样就实现了对一个对象不同属性的依赖收集，那么现在这个代码最简单的使用方法将是下面这样：
```js
const depsMap = new Map() // 每一项都是一个 Set 对象
function track(key) {
  ...
  
  // only for usage demo
  if(key === 'a'){
    dep.add(effectTimesA)
    dep.add(effectDivideA)
  }else if(key === 'b'){
    dep.add(effectTimesB)
    dep.add(effectDivideB)
  }
}

function trigger(key) {
  ...
}

let obj = { a: 10, b: 20 }
let timesA = 0
let divideA = 0
let timesB = 0
let divideB = 0
let effectTimesA = () => { timesA = obj.a * 10 }
let effectDivideA = () => { divideA = obj.a / 10 }
let effectTimesB = () => { timesB = obj.b * 10 }
let effectDivideB = () => { divideB = obj.b / 10 }

track('a')
track('b')

// 为了省事直接改成调用trigger，后文同样
trigger('a')
trigger('b')

// 100, 1, 200, 2
console.log(`${timesA}, ${divideA}, ${timesB}, ${divideB}`)
obj.a = 100
obj.b = 200

trigger('a')
trigger('b')
// 期望得到：1000, 10, 2000, 20 实际得到：1000, 10, 2000, 20
console.log(`${timesA}, ${divideA}, ${timesB}, ${divideB}`)
```

代码看起来仍然是臃肿无比，别着急，后面的设计会优化这个问题。

### 响应多个对象
我们已经实现了对一个对象的响应编程，那么要对多个对象实现响应式编程该怎么做呢？

脑袋一拍，继续往外嵌套一层对象不就可以了吗？没错，你可以用 ES6 中的 `WeakMap` 轻松实现，`WeakMap` 刚好可以（只能）把对象当作 `key`。（题外话，[Map 和 WeakMap 的区别](https://www.jianshu.com/p/4220272051e2)）

我们假想实现后是这样的效果：
```js
let obj1 = { a: 10, b: 20 }
let obj2 = { c: 30, d: 40 }
const targetMap = new WeakMap()

// 省略代码
// 获取 obj1 的 depsMap
// 获取 obj2 的 depsMap

targetMap.set(obj1, "obj1's depsMap")
targetMap.set(obj2, "obj2's depsMap")
```

这里暂且不纠结为什么叫 `targetMap`，现在整体依赖关系如下：
|  名称 |  类型 | key | 值 |
|---|---|---|---|
| targetMap  | WeakMap | object  | depsMap |
| depsMap    | Map     | property| dep     |
| dep        | Set     |         | effect  |

- targetMap: 存放每个响应式对象（所有属性）的依赖项
- targetMap: 存放响应式对象每个属性对应的依赖项
- dep: 存放某个属性对应的所有依赖项（当这个对象对应属性的值发生变化时，这些依赖项函数会重新执行）

现在我们可以实现这个功能了，核心代码如下：
```js
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
  // 先忽略这个
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
```

那么现在这个代码最简单的使用方法将是下面这样：
```js
const targetMap = new WeakMap();

function track(target, key) {
  ...

  // only for usage demo
  if(key === 'a'){
    dep.add(effectTimesA)
    dep.add(effectDivideA)
  }
}

function trigger(target, key) {
  ...
}

let obj = { a: 10, b: 20 }
let timesA = 0
let divideA = 0
let effectTimesA = () => { timesA = obj.a * 10 }
let effectDivideA = () => { divideA = obj.a / 10 }

track(obj, 'a')
trigger(obj, 'a')

console.log(`${timesA}, ${divideA}`) // 100, 1
obj.a = 100

trigger(obj, 'a')
console.log(`${timesA}, ${divideA}`) // 1000, 10
```

至此，我们对响应式的基本概念有了了解，我们已经做到了收集所有响应式对象的依赖项，但是现在你可以看到代码的使用是极其繁琐的，主要是因为我们还没实现自动收集依赖项、自动触发修改。

消化一下，下回继续～

## Lesson 2 - Proxy 和 Reflect
上一节讲到了我们实现了基本的响应功能，但是我们目前还是手动进行依赖收集和触发更新的。

解决这个问题的方法应该是：
- 当访问（`GET`）一个属性时，我们就调用 `track(obj, <property>)` 自动收集依赖项（存储 `effect`）
- 当修改（`SET`）一个属性时，我们就调用 `trigger(obj, <property>` 自动触发更新（执行存储的`effect`）

那么现在问题就是，我们如何在访问或修改一个属性时做到这样的事情？也即是如何拦截这种 `GET` 和 `SET` 操作？

Vue 2中我们使用 ES5 中的 `Object.defineProperty` 来拦截 `GET` 和 `SET`。
Vue 3中我们将使用 ES6 中的 `Reflect` 和 `Proxy`。（注意：Vue 3不再支持IE浏览器，所以可以用比较多的高级特性）

我们先来看一下怎么输出一个对象的一个属性值，可以用下面这三种方法：
- 使用 `.` => `obj.a`
- 使用 `[]` => `obj['a']`
- 使用 ES6 中的 `Reflect` => `Reflect.get(obj, 'a')`

这三种方法都是可行的，但是 `Reflect` 有非常强大的能力，后面会讲到。

### Proxy
我们先来看看 `Proxy`，`Proxy` 是另一个对象的占位符，默认是对这个对象的委托。你可以在这里查看 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 更详细的用法。
```js
let obj = { a: 1}
let proxiedObj = new Proxy(obj, {})
console.log(proxiedObj.a) // 1
```
这个过程可以表述为，获取 `proxiedObj.a` 时，直接去从查找 `obj.a`然后返回给 `proxiedObj`，再输出 `proxiedObj.a`。

`Proxy` 的第二个参数被称为 `handler`，`handler`就是包含捕捉器（trap）的占位符对象，即处理器对象，捕捉器允许我们拦截一些基本的操作，如：
- 查找属性
- 枚举
- 函数的调用

现在我们的示例代码修改为：
```js
let obj = { a: 1}
let proxiedObj = new Proxy(obj, {
  get(target, key) {
    console.log('Get')
    return target[key]
  }
})
console.log(proxiedObj.a) // 1
```
这段代码中，我们直接使用 `target[key]` 返回值，它直接返回了**原始对象**的值，不做任何其它操作，这对于这个简单的示例来说没任何问题，。

现在我们看一下下面这段稍微复杂一点的代码：
```js
let obj = {
  a: 1,
  get b() { return this.a }
}

let proxiedObj = new Proxy(obj, {
  get(target, key, receiver) {
    return target[key] // 这里的target是obj
  }
})

let childObj = Object.create(proxiedObj)
childObj.a = 2
console.log(childObj.b) // 期望得到2 实际输出1
```

这段代码的输出结果就是错误的，这是什么情况？难道是原型继承写错了吗？我们尝试把`Proxy`相关代码去掉，发现输出是正常的......
这个问题其实就出在 `return target[key]`这一行：
1. 当读取 `childObj.b` 时，`childObj` 上没有属性 `b`，因此会从原型链上查找
2. 原型链是 `proxiedObj`
3. 读取 `proxiedObj.b` 时，会触发`Proxy`捕捉器（trap）中的 `get`，这直接从**原始对象**中返回了 `target[key]`
4. 这里`target[key]` 中 `key` 是一个 `getter`，因此这个 `getter` 中的上下文 `this` 即为target，这里的 `target` 就是 `obj`，因此直接返回了 `1`。

> 参考 [为什么要使用 Reflect](https://javascript.info/proxy?tdsourcetag=s_pctim_aiomsg#proxying-a-getter)

那么我们怎么解决这个 `this` 出错的问题呢？

### Reflect
现在我们就可以讲讲 `Reflect` 了。你可以在这里查看 [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect) 更详细的用法。


捕获器 `get` 有第三个参数叫做 `receiver`。

> `Proxy` 中 `handler.get(target, prop, receiver)` 中的参数 `receiver` ：`Proxy` 或者继承 `Proxy` 的对象。

> `Reflect.get(target, prop, receiver)` 中的参数 `receiver` ：如果`target` 对象中指定了 `getter`，`receiver` 则为 `getter` 调用时的 `this` 值。

这确保了当我们的对象从另一个对象继承了值或函数时使用 `this` 值的正确性。

我们修改刚才的示例如下：
```js
let obj = {
  a: 1,
  get b() { return this.a }
}

let proxiedObj = new Proxy(obj, {
  // 本例中这里的receiver为调用时的对象childOjb
  get(target, key, receiver) {
    // 这里的target是obj
    // 这意思是把receiver作为this去调用target[key]
    return Reflect.get(target, key, receiver)
  }
})

let childObj = Object.create(proxiedObj)
childObj.a = 2;
console.log(childObj.b) // 期望得到2 实际输出1
```

现在我们弄清楚了为什么要结合 `Reflect` 来使用 `Proxy`，有了这些知识，就可以继续完善我们的代码了。

### 实现reactive函数
现在修改我们的示例代码为：
```js
let obj = { a: 1}
let proxiedObj = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('Get')
    return Reflect.get(target, key, receiver)
  }
  set(target, key, value, receiver) {
    console.log('Set')
    return Reflect.set(target, key, value, receiver)
  }
})
console.log(proxiedObj.a) // Get 1
```

接下来我们要做的就是结合 `Proxy` 的 `handler` 和 之前实现了的 `track`、`trigger` 来完成一个响应式模块。

首先，我们来封装一下 `Proxy` 相关代码，和Vue 3保持一致叫`reactive`。
```js
function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver)
    }
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver)
    }
  }
  return new Proxy(target, handler)
}
```

现在把`reactive`引入到我们的第一节中最后的示例代码中。

```js
let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let divideA = 0
let effectTimesA = () => { timesA = obj.a * 10 }
let effectDivideA = () => { divideA = obj.a / 10 }

track(obj, 'a')
trigger(obj, 'a')

console.log(`${timesA}, ${divideA}`) // 100, 1
obj.a = 100

trigger(obj, 'a')
console.log(`${timesA}, ${divideA}`) // 1000, 10
```

现在我们要做的是去掉示例代码中的 `track` 和 `trigger`。

回到本节开头提出的解决方案，我们已经可以拦截 `GET` 和 `SET` 操作了，只需要在适当的时候调用 `track` 和 `trigger` 方法即可，我们修改 `reactive` 代码如下：
```js
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

      // 这里判断条件不对，result为一个布尔值
      if(oldVal !== result){
        trigger(target, key)
      }
      return result
    }
  }
  return new Proxy(target, handler)
}
```

现在我们的示例代码可以精简为这样：
```js
let obj = reactive({ a: 10, b: 20 })
let timesA = 0
let divideA = 0
let effectTimesA = () => { timesA = obj.a * 10 }
let effectDivideA = () => { divideA = obj.a / 10 }

// 恢复调用 effect 的形式
effectTimesA()
effectDivideA()

console.log(`${timesA}, ${divideA}`) // 100, 1
obj.a = 100

console.log(`${timesA}, ${divideA}`) // 1000, 10
```

我们已经去掉了手动 `track` 和 `trigger` 代码，至此，我们已经实现了 `reactive` 函数，看起来和Vue 3源码差不多了。

但这还有点问题：
- `track` 函数中的 `effect` 现在还没处理，只能手动添加
- `reactive` 现在只能作用于对象，基本变量怎么办？

下一个章节我们将解决这个问题，让我们的代码更加接近Vue 3。

消化一下，下回继续～

## Lesson 3 - activeEffect 和 ref

## 其它