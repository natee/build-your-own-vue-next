# 创建你自己的Vue 3
Vue 3 内部原理讲解，深入理解 Vue 3，创建你自己的 Vue 3。
Deep Dive into Vue 3. Build Your Own Vue 3 From Scratch.

## 目录

  - [第1章 Vue 3总览](#第1章-vue-3总览)
    - [核心模块](./course/chapter1/OVERVIEW.md#核心模块)
      - [响应式模块](./course/chapter1/OVERVIEW.md#响应式模块)
      - [编译器模块](./course/chapter1/OVERVIEW.md#编译器模块)
      - [渲染器模块](./course/chapter1/OVERVIEW.md#渲染器模块)
    - [运行过程](./course/chapter1/OVERVIEW.md#运行过程)
  - [第2章 渲染机制](#第2章-渲染机制)
    - [Virtual DOM](./course/chapter2/RENDERER.md#virtual-dom)
      - [Virtual DOM 是什么](./course/chapter2/RENDERER.md#virtual-dom-是什么)
      - [为什么要用 Virtual DOM](./course/chapter2/RENDERER.md#为什么要用-virtual-dom)
    - [render 函数](./course/chapter2/RENDERER.md#render-函数)
      - [render 函数是什么](./course/chapter2/RENDERER.md#render-函数是什么)
      - [为什么要提供 render 函数](./course/chapter2/RENDERER.md#为什么要提供-render-函数)
      - [render 函数使用方法](./course/chapter2/RENDERER.md#render-函数使用方法)
      - [render 函数使用场景](./course/chapter2/RENDERER.md#render-函数使用场景)
    - [结束语](./course/chapter2/RENDERER.md#结束语)
  - [第3章 渲染器原理及实现](#第3章-渲染器原理及实现)
    - [1. 编译器和渲染器 API 初探](./course/chapter3/1.API.md#1-编译器和渲染器-api-初探)
      - [Complier 和 Renderer](./course/chapter3/1.API.md#complier-和-renderer)
      - [编译器（Complier）真实场景](./course/chapter3/1.API.md#编译器complier真实场景)
    - [2. 设计 VNode](./course/chapter3/2.VNODE.md#2-设计-vnode)
      - [用 VNode 描述 HTML](./course/chapter3/2.VNODE.md#用-vnode-描述-html)
      - [用 VNode 描述抽象内容](./course/chapter3/2.VNODE.md#用-vnode-描述抽象内容)
      - [区分 VNode 类型](./course/chapter3/2.VNODE.md#区分-vnode-类型)
      - [区分 children 的类型](./course/chapter3/2.VNODE.md#区分-children-的类型)
      - [定义 VNode](./course/chapter3/2.VNODE.md#定义-vnode)
    - [3. 生成 VNode 的 h 函数](./course/chapter3/3.HFUNCTION.md#3-生成-vnode-的-h-函数)
      - [基本的 h 函数](./course/chapter3/3.HFUNCTION.md#基本的-h-函数)
      - [完整的 h 函数](./course/chapter3/3.HFUNCTION.md#完整的-h-函数)
    - [4. 渲染 VNode 的 mount 函数](./course/chapter3/4.MOUNT.md#4-渲染-vnode-的-mount-函数)
      - [mount 函数基本原理](./course/chapter3/4.MOUNT.md#mount-函数基本原理)
      - [解决 `VNode` 的类型问题](./course/chapter3/4.MOUNT.md#解决-vnode-的类型问题)
        - [渲染文本节点](./course/chapter3/4.MOUNT.md#渲染文本节点)
        - [渲染标签节点](./course/chapter3/4.MOUNT.md#渲染标签节点)
        - [渲染普通有状态组件](./course/chapter3/4.MOUNT.md#渲染普通有状态组件)
        - [渲染函数式组件](./course/chapter3/4.MOUNT.md#渲染函数式组件)
      - [设置 DOM 属性](./course/chapter3/4.MOUNT.md#设置-dom-属性)
      - [渲染子节点](./course/chapter3/4.MOUNT.md#渲染子节点)
      - [关联 `VNode` 及其 DOM](./course/chapter3/4.MOUNT.md#关联-vnode-及其-dom)
      - [完整实现](./course/chapter3/4.MOUNT.md#完整实现)
      - [完整示例](./course/chapter3/4.MOUNT.md#完整示例)
    - [5. 实现 patch 函数](./course/chapter3/5.PATCH.md#5-实现-patch-函数)
      - [patch 的作用](./course/chapter3/5.PATCH.md#patch-的作用)
      - [patch 函数实现](./course/chapter3/5.PATCH.md#patch-函数实现)
        - [比较 props](./course/chapter3/5.PATCH.md#比较-props)
        - [比较 children](./course/chapter3/5.PATCH.md#比较-children)
      - [完整实现](./course/chapter3/5.PATCH.md#完整实现)
      - [完整示例](./course/chapter3/5.PATCH.md#完整示例)
    - [6. patch 函数优化](./course/chapter3/6.DIFF.md#patch-函数优化)
      - [准备工作](./course/chapter3/6.DIFF.md#准备工作)
      - [简单的 diff 算法](./course/chapter3/6.DIFF.md#简单的-diff-算法)
      - [优化版本的 diff 算法](./course/chapter3/6.DIFF.md#优化版本的-diff-算法)
        - [新增节点](./course/chapter3/6.DIFF.md#新增节点)
        - [删除节点](./course/chapter3/6.DIFF.md#删除节点)
      - [关于核心 diff 算法](./course/chapter3/6.DIFF.md#关于核心-diff-算法)
  - [第4章 响应式原理及实现](#第4章-响应式原理及实现)
    - [1. 实现响应式](./course/chapter4/1.REACTIVITY.md#1-实现响应式)
      - [响应基本类型变量](./course/chapter4/1.REACTIVITY.md#响应基本类型变量)
      - [响应对象的不同属性](./course/chapter4/1.REACTIVITY.md#响应对象的不同属性)
      - [响应多个对象](./course/chapter4/1.REACTIVITY.md#响应多个对象)
    - [2. Proxy 和 Reflect](./coursee/../course/chapter4/2.PROXY&REFLECT.md#2-proxy-和-reflect)
      - [Proxy](./coursee/../course/chapter4/2.PROXY&REFLECT.md#proxy)
      - [Reflect](./coursee/../course/chapter4/2.PROXY&REFLECT.md#reflect)
      - [实现reactive函数](./coursee/../course/chapter4/2.PROXY&REFLECT.md#实现reactive函数)
    - [3. activeEffect 和 ref](./course/chapter4/3.ACTIVEEFFECT&REF.md#3-activeeffect-和-ref)
      - [只响应需要依赖更新的代码（effect）](./course/chapter4/3.ACTIVEEFFECT&REF.md#只响应需要依赖更新的代码effect)
        - [现阶段完整代码](./course/chapter4/3.ACTIVEEFFECT&REF.md#现阶段完整代码)
      - [实现ref](./course/chapter4/3.ACTIVEEFFECT&REF.md#实现ref)
        - [现阶段完整代码](./course/chapter4/3.ACTIVEEFFECT&REF.md#现阶段完整代码-1)
    - [4. Computed](./course/chapter4/4.COMPUTED.md#4-computed)
      - [实现computed](./course/chapter4/4.COMPUTED.md#实现computed)
        - [现阶段完整代码](./course/chapter4/4.COMPUTED.md#现阶段完整代码-2)
      - [尚存问题](./course/chapter4/4.COMPUTED.md#尚存问题)
  - [第5章 创建一个迷你 Vue](#第5章-创建一个迷你-vue)
  - [第6章 Composition API](#第6章-composition-api)
    - [介绍](./course/chapter6/COMPOSITION-API.md#介绍)
    - [举个例子](./course/chapter6/COMPOSITION-API.md#举个例子)
      - [需求](./course/chapter6/COMPOSITION-API.md#需求)
      - [实现](./course/chapter6/COMPOSITION-API.md#实现)
      - [存在的问题](./course/chapter6/COMPOSITION-API.md#存在的问题)
    - [代码组织及复用](./course/chapter6/COMPOSITION-API.md#代码组织及复用)
      - [需求变更](./course/chapter6/COMPOSITION-API.md#需求变更)
      - [需求变更实现](./course/chapter6/COMPOSITION-API.md#需求变更实现)
      - [存在的问题](./course/chapter6/COMPOSITION-API.md#存在的问题-1)
      - [解决问题](./course/chapter6/COMPOSITION-API.md#解决问题)
    - [使用 Composition API](./course/chapter6/COMPOSITION-API.md#使用-composition-api)
  - [其它](#其它)

## 第1章 Vue 3总览

**你能学到什么**
- 了解 Vue 3 核心模块的功能
- 了解 Vue 3 整体的运行过程

点此学习 [Vue 3 总览](./course/chapter1/OVERVIEW.md)

## 第2章 渲染机制
**你能学到什么**
- 了解 Virtual DOM 存在的意义
- 了解 `render` 函数存在的必要性
- 了解 `tempalte` 和 `render` 的使用场景

点此学习 [Vue 3 渲染机制](./course/chapter2/RENDERER.md)

## 第3章 渲染器原理及实现

**你能学到什么**
- 了解 Vue 3 中的 `VNode`
- 了解 `render` 的具体渲染原理
- 了解 `diff` 算法的作用
- 实现 Vue 3 中渲染器功能

点此学习[渲染器原理及实现](./course/chapter3/OVERVIEW.md)

## 第4章 响应式原理及实现

**你能学到什么**
- 了解 `reactive` 设计理念
- 开发独立的响应式库

点此学习[响应式原理及实现](./course/chapter4/OVERVIEW.md)

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

## 第5章 创建一个迷你 Vue 3
**你能学到什么**
- 整合代码，创建迷你 vue

点此学习[创建一个迷你 Vue 3](./course/chapter5/MINI-VUE.md)

## 第6章 Composition API
**你能学到什么**
- 了解 Vue 3 Composition API
- 代码组织

点此学习[Composition API介绍](./course/chapter6/COMPOSITION-API.md)


## 其它
### 参考
本教程制作过程参考了下列内容：
- [Vue 3 Deep Dive with Evan You](https://www.vuemastery.com/courses/vue3-deep-dive-with-evan-you/parting-words)
- [Vue 3 Reactivity](https://www.vuemastery.com/courses/vue-3-reactivity/reading-source-code-with-evan-you)
- [Vue 3渲染器的设计与实现](http://hcysun.me/vue-design/zh/essence-of-comp.html#%E7%BB%84%E4%BB%B6%E7%9A%84%E4%BA%A7%E5%87%BA%E6%98%AF%E4%BB%80%E4%B9%88)
- [MDN - JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [为什么要使用 Reflect](https://javascript.info/proxy?tdsourcetag=s_pctim_aiomsg#proxying-a-getter)

### 工具
- [Vue 3在线模板编译系统](https://vue-next-template-explorer.netlify.app/)