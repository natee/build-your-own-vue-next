# Vue 3 响应式原理及实现

完整目录
  
  - [1. 实现响应式](#1-实现响应式)
    - [响应基本类型变量](#响应基本类型变量)
    - [响应对象的不同属性](#响应对象的不同属性)
    - [响应多个对象](#响应多个对象)
  - [2. Proxy 和 Reflect](#2-proxy-和-reflect)
    - [Proxy](#proxy)
    - [Reflect](#reflect)
    - [实现reactive函数](#实现reactive函数)
  - [3. activeEffect 和 ref](#3-activeeffect-和-ref)
    - [只响应需要依赖更新的代码（effect）](#只响应需要依赖更新的代码effect)
      - [现阶段完整代码](#现阶段完整代码)
    - [实现ref](#实现ref)
      - [现阶段完整代码](#现阶段完整代码-1)
  - [Lesson4 - Computed](#lesson4---computed)
    - [实现computed](#实现computed)
      - [现阶段完整代码](#现阶段完整代码-2)
    - [Vue 3 源码](#vue-3-源码)

本章节将带你从零开始实现一个响应式库，分为如下几部分来讲解。

## 1. 实现响应式
[点此学习](./1.REACTIVITY.md)

## 2. Proxy 和 Reflect
[点此学习](./2.PROXY&REFLECT.md)

## 3. activeEffect 和 ref
[点此学习](./3.ACTIVEEFFECT&REF.md)

## 4. Computed
[点此学习](./4.COMPUTED.md)
