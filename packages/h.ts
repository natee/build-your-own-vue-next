import { ShapeFlags } from './shapeFlags'

export function h(tag, props = null, children = null) {

  let shapeFlag = null
  // 这里为了简化，直接这样判断
  if (typeof tag === 'string') {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (typeof tag === 'object') {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  } else if (typeof tag === 'function') {
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
  }

  const vnode = {
    _isVNode: true,
    el: null,
    shapeFlag,
    tag,
    props,
    key: props && props.key !== undefined ? props.key : null,
    children
  }
  normalizeChildren(vnode, vnode.children)
  return vnode
}

export function normalizeChildren(vnode, children) {
  let type = 0
  if (children == null) {
    children = null
  } else if (Array.isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    type = ShapeFlags.SLOTS_CHILDREN
  } else if (typeof children === 'string') {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  } else if (typeof children === 'number') {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  // 赋值给 vnode.children 使得修改的 children 能生效，
  // 基本类型修改不会影响原始值
  vnode.children = children
  vnode.shapeFlag |= type
}
