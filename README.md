# 构建你自己的Vue-Next
vue-next 内部原理讲解。

## Reactivity 响应式设计

### 你能学到什么
- Vue.js设计模式
- 开发独立的响应式库

### 实现
[从头开始实现响应式设计](./reactive.md)

### 总结

- 依赖收集三个核心概念`effect`、`track`和`trigger`
  - WeakMap
  - Map
  - Set
- Vue 3 使用了 `Proxy` 来实现响应式。
  - [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
  - [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- ...

