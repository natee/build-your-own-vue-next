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
      // 我们暂且这样粗暴地判断
      const hasKey = newChildren[0].key !== null
      if (hasKey) {
        patchUnkeyedChildren(oldChildren, newChildren, el)
      } else {
        patchKeyedChildren(oldChildren, newChildren, el)
      }
    }
  }
}

/**
 * @param c1 old old children
 * @param c2 new new children
 */
function patchUnkeyedChildren(c1, c2, container) {
  const commonLen = Math.min(c2.length, c1.length)
  for (let i = 0; i < commonLen; i++) {
    patch(c1[i], c2[i])
  }
  if (c2.length > c1.length) {
    c2.slice(c1.length).forEach(child => {
      mount(child, container)
    })
  } else if (c2.length < c1.length) {
    c1.slice(c2.length).forEach(child => {
      container.removeChild(child.el)
    })
  }
}

function patchKeyedChildren(c1, c2, container) {
  let indexArr = []
  for (let i = 0; i < c2.length; i++) {
    const newChild = c2[i];
    for (let j = 0; j < c1.length; j++) {
      const oldChild = c1[j];
      if (newChild.key === oldChild.key) {
        patch(oldChild, newChild)
        indexArr.push(j)
        break
      }
    }
  }

  sortChildrenElements(c1, c2, container, indexArr)
}

// n1.children = [el-a, el-b, el-c] => [el-c, el-b, el-a]
// indexArr 为新 children 索引列表[2,1,0]
// 这表示要把旧 children 中索引为1的元素插入到索引为0之前
function sortChildrenElements(c1, c2, container, indexArr) {
  let index = indexArr.length - 1
  while (index > 0) {
    // 把新children
    const lastChildNode = c1[indexArr[index]].el
    const prevChildNode = c1[indexArr[index - 1]].el
    container.insertBefore(prevChildNode, lastChildNode)
    index--
  }
}
