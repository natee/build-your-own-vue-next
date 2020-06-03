# 实现创建 VNode 的 h 函数

首先我们实现一个最简单的 `h` 函数，接收三个参数：
- `tag` 标签名
- `props` DOM 上的属性
- `children` 子节点

```js
function h(tag, props, children){
  return {
    tag,
    props,
    children
  }
}

function mount(vnode, container){

}
```