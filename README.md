# 构建你自己的Vue-Next
vue-next 内部原理讲解，深入理解 Vue 3。

- [构建你自己的Vue-Next](#构建你自己的vue-next)
  - [目录](#目录)
  - [第1章 Vue 3总览](#第1章-vue-3总览)
  - [第2章 渲染机制](#第2章-渲染机制)
  - [第3章 Reactivity响应式设计](#第3章-reactivity响应式设计)

## 目录

## 第1章 Vue 3总览

**你能学到什么**
- 了解 Vue 核心模块的功能
- 了解 Vue 整体的运行过程

点此学习 [Vue 3 总览](./course/chapter1/OVERVIEW.md)

## 第2章 渲染机制
**你能学到什么**
- Virtual DOM 存在的意义
- `render` 函数存在的意义
- `tempalte` 和 `render` 的使用场景

点此学习 [Vue 3 渲染机制](./course/chapter2/RENDERER.md)


## 第3章 Reactivity响应式设计

**你能学到什么**
- `reactive` 设计理念
- 开发独立的响应式库

点此 [从零实现响应式库](./chapter3/REACTIVE.md)

**总结**

- 依赖收集三个核心概念 `effect`、`track` 和 `trigger`
  - WeakMap
  - Map
  - Set
- Vue 3 使用了 `Proxy` 来实现响应式，使用 `Reflect` 是为了解决上下文 `this` 错误的问题
  - Proxy
  - Reflect
- `track` 只会收集响应式对象的依赖
- 基本类型变量用 `ref` 来实现响应式，对象用 `reactive` 实现响应式
- ...

