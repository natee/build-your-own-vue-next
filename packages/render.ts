import { ShapeFlags } from './shapeFlags'

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
  if(vnode.props){
    for(const key in vnode.props){
      const value = vnode.props[key]
      el.setAttribute(key, value)
    }
  }

  // children
  if(vnode.children){
    if(typeof vnode.children === 'string'){
      el.textContent = vnode.children
    }else{
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

export function mountFunctionalComponent(vnode, container){
  const $vnode = vnode.tag()
  mount($vnode, container)
  vnode.el = $vnode.el
}
