import { ShapeFlags } from './shapeFlags'

export function h(tag, props = null, children = null) {

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