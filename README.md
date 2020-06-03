# 构建你自己的Vue-Next
Vue 3 内部原理讲解，深入理解 Vue 3，创建你自己的 Vue 3。

- [构建你自己的Vue-Next](#构建你自己的vue-next)
  - [目录](#目录)
  - [第1章 Vue 3总览](#第1章-vue-3总览)
  - [第2章 渲染机制](#第2章-渲染机制)
  - [第3章 实现渲染器](#第3章-实现渲染器)
  - [第4章 实现响应式](#第4章-实现响应式)
  - [第5章 创建一个迷你 Vue](#第5章-创建一个迷你-vue)
  - [其它](#其它)

## 目录

## 第1章 Vue 3总览

**你能学到什么**
- 了解 Vue 核心模块的功能
- 了解 Vue 整体的运行过程

点此学习 [Vue 3 总览](./course/chapter1/OVERVIEW.md)

## 第2章 渲染机制
**你能学到什么**
- 了解 Virtual DOM 存在的意义
- 了解 `render` 函数存在的必要性
- 了解 `tempalte` 和 `render` 的使用场景

点此学习 [Vue 3 渲染机制](./course/chapter2/RENDERER.md)

## 第3章 实现渲染器

**你能学到什么**
- 了解 Vue 3 中的 `VNode`
- 了解 `render` 的具体渲染原理
- 实现 Vue 3 中渲染器功能

点此学习[实现渲染器](./course/chapter3/OVERVIEW.md)

## 第4章 实现响应式

**你能学到什么**
- 了解 `reactive` 设计理念
- 开发独立的响应式库

点此学习[从零实现响应式库](./chapter4/OVERVIEW.md)

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

## 第5章 创建一个迷你 Vue


## 其它
- [Vue 3在线模板编译系统](https://vue-next-template-explorer.netlify.app/)
- [Vue 3渲染器的设计与实现](http://hcysun.me/vue-design/zh/essence-of-comp.html#%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BA%A7%E5%87%BA%E6%98%AF%E4%BB%80%E4%B9%88)
