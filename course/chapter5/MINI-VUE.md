# 第5章 创建一个迷你 Vue 3
通过前几章的学习，我们已经实现了 Vue 3 核心三个模块中的两个，`renderer` 和 `reactivity`。本章我们将把这些内容组合起来使用，体验一个迷你版的 Vue。

我们新建一个 `mini-vue.html`，引入所有已实现的代码，然后引入以下示例代码：
```html
<html>
  <div id="app"></div>
  <script>
    // renderer、reactive 等代码
  </script>
  <script>
    const CountComponent = {
      data: reactive({
        count: 0
      }),
      render() {
        return h('div', { class: 'count-wrap' }, [
          h('p', null, 'I am a counter'),
          h('span', null, this.data.count),
          h('button', {
            onClick: () => {
              this.data.count++
            }
          }, 'count')
        ])
      }
    }

    const App = {
      data: reactive({
        msg: 'Hello, Mini-Vue'
      }),
      render() {
        return h('div', { class: 'app' }, [
          h('h1', null, this.data.msg),
          h('button', {
            onClick: () => {
              this.data.msg = 'Byb'
            }
          }, 'Change Text'),
          h(CountComponent)
        ])
      }
    }

    function mountApp(component, container) {
      let isMounted = false
      let prevVdom
      effect(() => {
        if (!isMounted) {
          prevVdom = component.render()
          mount(prevVdom, container)
          isMounted = true
        } else {
          const newVdom = component.render()
          patch(prevVdom, newVdom)
          prevVdom = newVdom
        }
      })
    }

    mountApp(App, document.getElementById('app'))
  </script>
</html>
```

浏览器打开该页面，点击 `App` 内按钮时，文本发生变更，点击计数器时，数值未能更新，原因是我们没有调用 `effect` 收集依赖，现在修改一下 `render.ts` 中挂载组件的方法，以下代码仅供示意：

```js
function mountStatefulComponent(vnode, container) {
  let isMounted = false
  let prevVdom
  effect(() => {
    if (!isMounted) {
      const instance = vnode.tag
      prevVdom = instance.$vnode = instance.render()
      mount(prevVdom, container)
      instance.$el = vnode.el = instance.$vnode.el
      isMounted = true
    } else {
      const newVdom = vnode.tag.render()
      patch(prevVdom, newVdom)
      prevVdom = newVdom
    }
  })
}
```
此时我们再次点击计数器按钮，可以正常更新。

如果能够增加 `compiler` 功能，那么就会更加接近 Vue 3 了。

## 结束语
本教程并不是要带你弄清楚 Vue 3 中的每一处，而是带你实现你自己的 Vue 3，了解每一步需要做的事情，我们实现的过程中有非常多的细节未考虑（这些缺失的细节你都可以自己去完善补充），但是大致的过程都是遵循 Vue 3 总体运行机制来实现的。
