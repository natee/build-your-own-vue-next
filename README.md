# 构建你自己的Vue-Next
vue-next 内部原理讲解，深入理解 Vue 3。

- [构建你自己的Vue-Next](#构建你自己的vue-next)
  - [Vue 3 总览](#vue-3-总览)
    - [核心模块](#核心模块)
      - [reactivity 模块](#reactivity-模块)
      - [compiler 模块](#compiler-模块)
      - [renderer 模块](#renderer-模块)
    - [运行过程](#运行过程)
  - [渲染机制](#渲染机制)
    - [Virtual DOM](#virtual-dom)
      - [Virtual DOM 是什么](#virtual-dom-是什么)
      - [为什么要用 Virtual DOM](#为什么要用-virtual-dom)
    - [render 函数](#render-函数)
      - [render 函数是什么](#render-函数是什么)
      - [为什么要提供 render 函数](#为什么要提供-render-函数)
      - [render 函数使用方法](#render-函数使用方法)
      - [render 函数使用场景](#render-函数使用场景)
  - [Reactivity 响应式设计](#reactivity-响应式设计)
    - [你能学到什么](#你能学到什么)
    - [实现](#实现)
    - [总结](#总结)

## Vue 3 总览

本节你能学到什么：
- 了解 Vue 核心模块的功能
- 了解 Vue 整体的运行过程

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

## 渲染机制
本节你能学到什么：
- Virtual DOM 存在的意义
- `render` 函数存在的意义
- `tempalte` 和 `render` 的使用场景

### Virtual DOM

#### Virtual DOM 是什么
Virtual DOM 就是用 JavaScript 对象来描述真实的 DOM 节点。

例如，有这样一个 DOM 树：
```html
<div id="div">
  <button @click="click">click</button>
</div>
```
用 Virtual DOM 来表示就是：
```js
const vDom = {
  tag: 'div',
  id: 'div',
  children: [{
    tag: 'button',
    onClick: this.click
  }]
}
```

#### 为什么要用 Virtual DOM

1. **可跨平台**，Virtual DOM 使组件的渲染逻辑和真实 DOM 彻底解耦，因此你可以很方便的在不同环境使用它，例如，当你开发的不是面向浏览器的，而是 IOS 或 Android 或小程序，你可以利用编写自己的 `render` 函数，把 Virtual DOM 渲染成自己想要的东西，而不仅仅是 DOM。
2. **可程序式修改**，Virtual DOM 提供了一种可以通过编程的方式修改、检查、克隆 DOM 结构的能力，你可以在把 DOM 返回给渲染引擎之前，先利用基本的 JavaScript 来处理好。
3. **提升性能**，当页面中有大量的 DOM 节点操作时，如果涉及到了浏览器的回流和重绘，性能是十分糟糕的，就像第二条说的，在 DOM 返回给渲染引擎之前，我们可以先用 JavaScript 处理 Virtual DOM，最终才返回真实 DOM，极大减少回流和重绘次数。


### render 函数

#### render 函数是什么
首先我们知道，当你在编写 Vue 组件或页面时，一般会提供一个 `template` 选项来写 HTML 内容。根据[Vue 3 总览](#vue-3-总览)这一部分内容的介绍，Vue 会先走编译阶段，把 `template` 编译成 `render` 函数，所以说最终的 DOM 一定是从 `render` 函数输出的。因此 `render` 函数可以用来代替 `template`，它返回的内容就是 `VNode`。直接使用 `render` 反而可以省去 `complier` 过程。


#### 为什么要提供 render 函数
Vue 中提供的 `render` 函数是非常有用的，因为有些情况用 `template` 来表达业务逻辑会一定程度受到限制，这种情况你需要一种比较灵活的编程方式来表达底层的逻辑。

例如，当你有一个需求是大量的文本输入框，这中需求你要写的标签并不多，但是却揉了大量的交互逻辑，你需要在模板上添加大量的逻辑代码（比如控制关联标签的显示），然而，你的 JavaScript 代码中也有大量的逻辑代码。

`render` 函数的存在可以让你在一个地方写业务逻辑，这时你就不用太多的去考虑标签的问题了。

#### render 函数使用方法
Vue 3 中 `render` 函数使用方法如下：
 ```js
import { h } from 'vue'

render() {
  return h('div', {
    id: 'foo',
    onClick: this.onClick
  }, 'hello')
}
 ```
由于这是纯粹的 JavaScript，所以如果你需要实现 `templat` 中类似 `v-if`、`v-for` 这样的功能，直接通过三元表达式做到。
 ```js
import { h } from 'vue'

render() {
  let nodeToReturn

  // v-if="ok"
  if(this.ok) {
    nodeToReturn = h('div', { 
      id: 'foo', 
      onClick: this.onClick 
    }, 'ok')
  } else {
    // v-for="item in list"
    const children = this.list.map(item => {
      return h('p', { 
        key: item.id 
      }, item.text)
    })

    nodeToReturn = h('div', {}, children)
  }
  return nodeToReturn
}
 ```
这就是 `render` 基本使用用法，就是 JavaScript 代码而已。

#### render 函数使用场景
一般来说我们用 `tempate` 可以满足大多数场景来，但是你一定了解过 `slot` 这个东西，如果只使用 `tempate` 你将无法操作 `slot` 中的内容，如果你需要程序式地修改传进来的 `slot` 内容，你就必须用到 `render` 函数了（这也是大多数使用 `render` 函数的场景）。

下面我们用一个例子来说明。

比如我们要实现这样一个组件：实现层级缩进效果，即类似 HTML 中嵌套的 UL 标签，看起来就像这样：
```
level 1
  level 1-1
  level 1-2
    level 1-2-1
    level 1-2-2
```
我们的模板是这样写的，实际上 `Stack` 组件就是给每一个 `slot` 都增加一个左边距：
```html
<Stack size="10">
  <div>level 1</div>
  <Stack size="10">
    <div>level 1-1</div>
    <div>level 1-2</div>
    <Stack size="10">
      <div>level 1-2-1</div>
      <div>level 1-2-2</div>
    </Stack>
  </Stack>
</Stack>
```
现在我们只用 `template` 是无法实现这种效果的，众所周知，`template` 只能把默认的 `slot` 渲染出来，它不能程序式处理 `slot` 的值。

我们先用 `template` 来实现这个组件：
```js
const Stack = {
  props: {
    size: [String, Number]
  },
  template: `
    <div class="stack">
      <slot></slot>
    </div>
  `
}
```
这样由于不能处理 `slot` 内容，那么它的表现效果如下，并没有层级缩进：
```
level 1
level 1-1
level 1-2
level 1-2-1
level 1-2-2
```

我们现在尝试用 `render` 函数实现 `Stack` 组件：
```js
const { h } = Vue
const Stack = {
  props: {
    size: [String, Number]
  },
  render() {
    const slot = this.$slots.default
      ? this.$slots.default()
      : []

    return h('div', { class: 'stack' }, 
      // 这里给每一项 slot 增加一个缩进 class
      slot.map(child => {
      return h('div', { class: `ml${this.$props.size}` }, [ child ])
    }))
  }
}
```
`render` 函数中我们可以通过 `this.$slots` 拿到插槽内容，通过 JavaScript 把它处理成任何我们想要的东西，这里我们给每一项 `slot` 添加了一个 `margin-left: 10px` 缩进，看下效果：
```
level 1
  level 1-1
  level 1-2
    level 1-2-1
    level 1-2-2
```
完美，我们实现了一个用 `template` 几乎实现不了的功能。

**原则：** 
- 一般来说开发一些公共组件时才会用到 `render`
- 当你发现用 JavaScript 才能更好的表达你的逻辑时，那么就用 `render` 函数
- 日常开发的功能性组件使用 `template`，这样更高效，且 `template` 更容易被 `complier` 优化

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

