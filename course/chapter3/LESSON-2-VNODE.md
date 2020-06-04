# 设计 VNode
- [设计 VNode](#设计-vnode)
  - [用 VNode 描述 HTML](#用-vnode-描述-html)
  - [用 VNode 描述抽象内容](#用-vnode-描述抽象内容)
  - [区分 VNode 类型](#区分-vnode-类型)
  - [定义 VNode](#定义-vnode)

`render` 函数返回结果就是 `h` 函数执行的结果，因此 `h` 函数的输出为 `VNode`。

所以需要先设计一下我们的 `VNode`。

## 用 VNode 描述 HTML
一个 `html` 标签有它的标签名、属性、事件、样式、子节点等诸多信息，这些内容都需要在 `VNode` 中体现。

```html
<div id="div">
  div text
  <p>p text</p>
</div>
```
```js
const elementVNode = {
  tag: 'div',
  props: {
    id: 'div'
  },
  text: 'div text',
  children: [{
    tag: 'p',
    props: null,
    text: 'p text'
  }]
}
```

上面的代码显示了 DOM 变成 `VNode` 的表现形式，`VNode` 各属性解释：
- `tag` ：表示 DOM 元素的标签名，如 `div`、`span` 等
- `props`：表示 DOM 元素上的属性，如`id`、`class` 等
- `children`：表示 DOM 元素的子节点
- `text`：表示 DOM 元素的文本节点

这样设计 `VNode` 完全没有问题（实际上 Vue 2 就是这样设计的），但是 Vue 3 设计的 `VNode` 并不包含 `text` 属性，而是直接用 `children` 代替，因为 `text` 本质也是 DOM 的子节点。

**在保证语义讲得通的情况下尽可能复用属性，可以使 `VNode` 对象更加轻量**。

基于此我们把刚才的 `VNode` 修改成如下形式：
```js
const elementVNode = {
  tag: 'div',
  props: {
    id: 'div'
  },
  children: [{
    tag: null,
    props: null,
    children: 'div text'
  }, {
    tag: 'p',
    props: null,
    chldren: 'p text'
  }]
}
```

## 用 VNode 描述抽象内容
什么是抽象内容呢？组件就属于抽象内容，比如下面这一段模板内容：
```html
<div>
  <MyComponent></MyComponent>
</div>
```
`MyComponent` 是一个组件，我们预期渲染出 `MyComponent` 组件所有的内容，而不是一个 `MyComponent` 标签，这用 `VNode` 如何表示呢？

上一段内容我们其实已经通过 `tag` 是否为 `null` 来区分元素节点和文本节点了，那这里我们可以通过 `tag` 是否是字符串判断是标签还是组件呢？
```js
const elementVNode = {
  tag: 'div',
  props: null,
  children: [{
    tag: MyComponent,
    props: null
  }]
}
```
理论上是可以的，Vue 2 中就是通过 `tag` 来判断的，具体过程如下，可以在这里看[源码](https://github.com/vuejs/vue/blob/master/src/core/vdom/create-element.js#L92)：

1. `VNode.tag` 如果不是字符串，则创建组件类型的 `VNode`
2. `VNode.tag` 是字符串
    1. 若是内置的 `html` 或 `svg` 标签，则创建正常的 `VNode`
    2. 若是属于某个组件的 id，则创建组件类型的 `VNode`
    3. 未知或没有命名空间的组件，直接创建 `VNode`

以上这些判断都是在挂载(或 `patch`)阶段进行的，换句话说，一个 `VNode` 表示的内容需要在代码运行阶段才知道。这就带来了两个难题：无法从 `AOT` 的层面优化、开发者无法手动优化。

如果可以提前知道 `VNode` 类型，那么就可以对其进行优化，所以这里我们可以定义好一套用来判断 `VNode` 类型的规则，随便是用 `FLAG = 1` 这样的数字表示还是其它方法。

## 区分 VNode 类型
这里我们给 `VNode` 增加一个字段 `shapeFlag`（这是为了和 Vue 3 保持一致），它是一个枚举类型变量，具体如下：

```js
export const enum ShapeFlags {
  // html 或 svg 标签
  ELEMENT = 1,
  // 函数式组件
  FUNCTIONAL_COMPONENT = 1 << 1,
  // 普通有状态组件
  STATEFUL_COMPONENT = 1 << 2,
  // 子节点是纯文本
  TEXT_CHILDREN = 1 << 3,
  // 子节点是数组
  ARRAY_CHILDREN = 1 << 4,
  // 子节点是 slots
  SLOTS_CHILDREN = 1 << 5,
  // Portal
  PORTAL = 1 << 6,
  // Suspense
  SUSPENSE = 1 << 7,
  // 需要被keepAlive的有状态组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  // 已经被keepAlive的有状态组件
  COMPONENT_KEPT_ALIVE = 1 << 9,
  // 有状态组件和函数式组件都是“组件”，用 COMPONENT 表示
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
```
现在我们可以修改我们的 `VNode` 如下：
```js
const elementVNode = {
  shapeFlag: ShapeFlags.ELEMENT,
  tag: 'div',
  props: null,
  children: [{
    shapeFlag: ShapeFlags.COMPONENT,
    tag: MyComponent,
    props: null
  }]
}
```
`shapeFlag` 如何用来判断 `VNode` 类型呢？按位运算即可。
```js
const isComponent = vnode.shapeFlag & ShapeFlags.COMPONENT
```

熟悉一下按位运算。
- `a & b`：对于每一个比特位，只有两个操作数相应的比特位都是1时，结果才为1，否则为0。
- `a | b`：对于每一个比特位，当两个操作数相应的比特位至少有一个1时，结果为1，否则为0。

我们把 `ShapeFlags` 对应的值列出来，如下：
| ShapeFlags                  |  操作     | bitmap |
| --------------------------- | -------- | --------------- |
| ELEMENT                     |          | 000000000`1` |
| FUNCTIONAL_COMPONENT        | 1 << 1   | 00000000`1`0 |
| STATEFUL_COMPONENT          | 1 << 2   | 0000000`1`00 |
| TEXT_CHILDREN               | 1 << 3   | 000000`1`000 |
| ARRAY_CHILDREN              | 1 << 4   | 00000`1`0000 |
| SLOTS_CHILDREN              | 1 << 5   | 0000`1`00000 |
| PORTAL                      | 1 << 6   | 000`1`000000 |
| SUSPENSE                    | 1 << 7   | 00`1`0000000 |
| COMPONENT_SHOULD_KEEP_ALIVE | 1 << 8   | 0`1`00000000 |
| COMPONENT_KEPT_ALIVE        | 1 << 9   | `1`000000000 |

```js
COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
```
根据上表展示的基本 `flags` 值可以很容易地得出下表：

| ShapeFlags         |   bitmap         |
| ------------------ | ---------------- |
| COMPONENT          | 0000000`1` `1`0  |

## 定义 VNode
至此，我们可以定义 `VNode` 结构如下：
```js
export interface VNodeProps {
  [key: string]: any
}
export interface VNode {
  // _isVNode 是 VNode 对象
  _isVNode: true
  // el VNode 对应的真实 DOM
  el: Element | null
  shapeFlag: ShapeFlags.ELEMENT,
  tag: | string | Component | null,
  props: VNodeProps | null,
  children: string | Array<VNode>
}
```

实际上，Vue 3 中对 `VNode` 的定义要复杂的多，这里就不去细看了。

消化一下，下回继续～

[下一课 - 实现创建 VNode 的 h 函数](./LESSON-3-HFUNCTION.md)
