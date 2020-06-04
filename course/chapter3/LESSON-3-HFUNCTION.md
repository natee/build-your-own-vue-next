# 实现创建 VNode 的 h 函数

首先我们实现一个最简单的 `h` 函数，可以是这样的，接收三个参数：
- `tag` 标签名
- `props` DOM 上的属性
- `children` 子节点

我们新建一个文件 `h.ts`，内容如下：
```js
function h(tag, props, children){
  return {
    tag,
    props,
    children
  }
}
```

我们用如下的 `VNode` 来表示 `<div class="red"><span>hello</span></div>`：
```js
import { h } from './h'
const vdom = h('div', {
  class: 'red'
}, [
  h('span', null, 'hello')
])
```
看一下实际输出内容：
```js
const vdom = {
  "tag": "div",
  "props": {
    "class": "red"
  },
  "children": [
    {
      "tag": "span",
      "props": null,
      "children": "hello"
    }
  ]
}
```
基本符合预期，但是这里有同学可能又要问了：“这个 `vdom` 和写的 `h` 函数没什么不同，为什么不直接写 `VNode`？”

这是因为我们现在的 `h` 函数所做的仅仅就是返回传入的参数，实际上根据上一课对 `VNode` 的定义，我们还缺少几个字段，这里我们补全它：
```js
import { ShapeFlags } from './shapeFlags'

function h(tag, props = null, children = null) {

  let shapeFlag = null
  // 这里为了简化，直接这样判断
  if (typeof tag === 'string') {
    shapeFlag = ShapeFlags.ELEMENT
  } else {
    shapeFlag = ShapeFlags.COMPONENT
  }

  return {
    _isVNode: true,
    el: null,
    shapeFlag,
    tag,
    props,
    children
  }
}
```
我们当然可以直接写 `VNode`，但这样会增加大量的额外工作量。

现在来看一下结果：
```js
const vdom = {
  _isVNode: true,
  el: null,
  shapeFlag: 1,
  tag: 'div',
  props: { class: 'red' },
  children: [
    {
      _isVNode: true,
      el: null,
      shapeFlag: 1,
      tag: 'span',
      props: null,
      children: 'hello'
    }
  ]
}
```
至此已经完成了 `h` 函数的基本设计，可以得到想要的 `VNode` 了，下一步就是把 `VNode` 渲染到页面上。

消化一下，下回继续～

[下一课 - 实现渲染器挂载的 mount 函数](./LESSON-4-MOUNT.md)
