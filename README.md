# 构建你自己的Vue-Next
vue-next 内部原理讲解，深入理解 Vue 3。

- [构建你自己的Vue-Next](#构建你自己的vue-next)
  - [Vue 3 总览](#vue-3-总览)
    - [核心模块](#核心模块)
      - [reactivity 模块](#reactivity-模块)
      - [compiler 模块](#compiler-模块)
      - [renderer 模块](#renderer-模块)
    - [运行过程](#运行过程)
  - [Reactivity 响应式设计](#reactivity-响应式设计)
    - [你能学到什么](#你能学到什么)
    - [实现](#实现)
    - [总结](#总结)

## Vue 3 总览
### 核心模块
Vue 3有三个核心模块，分别是：
- `reactivity` 模块
- `compiler` 模块
- `renderer` 模块

#### reactivity 模块
`reactivity` 模块用来创建响应式对象，我们可以监听这些对象的修改，当执使用了这些响应式对象的代码执行时，他们就会被跟踪，当响应式对象的值发生了变化时，这些被追踪的代码会重新执行。

#### compiler 模块
`compiler` 模块是用来处理模板的，它把模板编译成 `render` 函数，它可以发生在浏览器的运行阶段，但更多的是在Vue项目构建时进行编译。

#### renderer 模块
`renderer` 模块处理 `VNode`，把组件渲染到 web 页上。它包含三个阶段：
1. `Render` 阶段，调用 `render` 函数并返回一个 `VNode`；
2. `Mount`  阶段，`render` 接收 `VNode`，然后进行 JavaScript DOM 操作来创建 web 页；
3. `Patch` 阶段，`render` 接收新旧两个 `VNode`，比较二者的不同，然后进行页面的局部更新。

### 运行过程
1. `compiler` 把 HTML 编译成 `render` 函数；
2. `reactivity` 模块初始化 `reactive` 对象；
3. `renderer` 模块的 `Render` 阶段，调用引用了 `reactive` 对象的 `render` 函数，这样就监听了响应式对象，`render` 函数返回 `VNode`；
4. `renderer` 模块的 `Monut` 阶段，用 `VNode` 生成真实的 DOM 并渲染到页面上；
5. 如果 `reactive` 对象发生了变化，将再次调用 `render` 函数创建新的 `VNode`，这时将进入 `renderer` 模块的 `Patch` 阶段，更新页面的变化。


## Reactivity 响应式设计

### 你能学到什么
- `reactive` 设计理念
- 开发独立的响应式库

### 实现
[从头开始实现响应式设计](./reactive.md)

### 总结

- 依赖收集三个核心概念 `effect`、`track` 和 `trigger`
  - WeakMap
  - Map
  - Set
- Vue 3 使用了 `Proxy` 来实现响应式，使用 `Reflect` 是为了解决上下文 `this` 错误的问题
  - [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
  - [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- `track` 只会收集响应式对象的依赖
- 基本类型变量用 `ref` 来实现响应式，对象用 `reactive` 实现响应式
- ...

