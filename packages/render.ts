import { ShapeFlags } from './shapeFlags'
import { isArray, isString } from './utils'

export function mount(vnode, container) {
  if (vnode.tag === null) {
    mountTextElement(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    mountStatefulComponent(vnode, container)
  } else if (vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
    mountFunctionalComponent(vnode, container)
  }
}

export function mountTextElement(vnode, container) {
  const el = document.createTextNode(vnode.children)
  vnode.el = el
  container.appendChild(el)
}

export function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag)

  // props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      el.setAttribute(key, value)
    }
  }

  // children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(child => {
        mount(child, el)
      })
    }
  }

  vnode.el = el
  container.appendChild(el)
}

export function mountStatefulComponent(vnode, container) {
  const instance = vnode.tag
  instance.$vnode = instance.render()
  mount(instance.$vnode, container)
  instance.$el = vnode.el = instance.$vnode.el
}

export function mountFunctionalComponent(vnode, container) {
  const $vnode = vnode.tag()
  mount($vnode, container)
  vnode.el = $vnode.el
}

/**
 * @param n1 old VNode
 * @param n2 new VNode
 */
export function patch(n1, n2) {
  if (n1.tag === n2.tag) {
    const el = n2.el = n1.el // (*)
    patchProps(n1, n2, el)
    patchChildren(n1, n2, el)
  } else {
    // replace
  }
}

export function patchProps(n1, n2, el) {
  // update props
  // `n1` 和 `n2` 都存在有无 `props` 的情况
  const oldProps = n1.props || {}
  const newProps = n2.props || {}
  // add prop or update prop
  for (const key in newProps) {
    const oldVal = oldProps[key]
    const newVal = newProps[key]
    if (newVal !== oldVal) {
      el.setAttribute(key, newVal)
    }
  }

  // remove prop
  for (const key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      el.removeAttribute(key)
    }
  }
}

export function patchChildren(n1, n2, el) {
  // update children
  const oldChildren = n1.children
  const newChildren = n2.children

  if (isString(newChildren)) {
    if (isString(oldChildren)) {
      oldChildren !== newChildren && (el.textContent = newChildren)
    } else {
      el.textContent = newChildren
    }
  } else if (isArray(newChildren)) {
    if (isString(oldChildren)) {
      el.innerHTML = ''
      newChildren.forEach(child => {
        mount(child, el)
      })
    } else if (isArray(oldChildren)) {
      diffArrayChildren(oldChildren, newChildren, el)
    }
  }
}

function diffArrayChildren(oldChildren, newChildren, container) {
  const commonLen = Math.min(newChildren.length, oldChildren.length)
  for (let i = 0; i < commonLen; i++) {
    patch(oldChildren[i], newChildren[i])
  }
  if (newChildren.length > oldChildren.length) {
    newChildren.slice(oldChildren.length).forEach(child => {
      mount(child, container)
    })
  } else if (newChildren.length < oldChildren.length) {
    oldChildren.slice(newChildren.length).forEach(child => {
      container.removeChild(child.el)
    })
  }
}
