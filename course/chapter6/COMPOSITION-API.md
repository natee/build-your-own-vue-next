# 第6章 Composition API
- [第6章 Composition API](#第6章-composition-api)
  - [介绍](#介绍)
  - [举个例子](#举个例子)
    - [需求](#需求)
    - [实现](#实现)
    - [存在的问题](#存在的问题)
  - [代码组织及复用](#代码组织及复用)
    - [需求变更](#需求变更)
    - [需求变更实现](#需求变更实现)
    - [存在的问题](#存在的问题-1)
    - [解决问题](#解决问题)
  - [使用 Composition API](#使用-composition-api)

## 介绍

[Vue 组合式 API](https://composition-api.vuejs.org/zh/#%E6%A6%82%E8%BF%B0) 官网详细介绍。

## 举个例子
接下来我们用一个示例来说明 composition-api 的灵活性。

### 需求
根据 `ID` 请求接口数据，假设叫文章列表。

### 实现
新建文件 `composition-api.html`，添加如下内容：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Composition API</title>
  <script src="https://unpkg.com/vue@next"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    const { createApp } = Vue
    const App = {
      template: `
        <div v-if="isPending">loading...</div>
        <div v-else-if="data">data:{{data}}</div>
        <div v-else-if="error">error:{{error.message}}</div>
        <button @click="changeID">change ID</button>
      `,
      setup() {
        const id = ref(1)
        const data = ref(null)
        const error = ref(null)
        const isPending = ref(true)

        function changeID() {
          id.value++
          getData(id.value)
        }

        function getData(id) {
          isPending.value = true
          setTimeout(() => {
            data.value = {
              text: 'success',
              id: id
            }
            isPending.value = false
          }, 500)
        }

        getData(id.value)

        return {
          id,
          data,
          error,
          isPending,
          changeID
        }
      }
    }
    createApp(App).mount('#app')
  </script>
</body>
</html>
```

这样就实现了进入页面请求一次数据，点击按钮更换了 `ID` 重新请求数据。

### 存在的问题
- 当 `App` 中有多个功能时，代码将会逐渐累增，比较难以区分逻辑与功能的对应关系
- 若当前文章列表功能需要复用，则需要再次修改

## 代码组织及复用

### 需求变更
这个列表在其它地方也需要用到。

### 需求变更实现
我们需要把文章列表相关功能抽离，形成一个 `PostComponent` 组件，组件接收 `id` 参数并 `watch` 其变化进行列表更新。

你的代码可能是这样：
```js
const PostComponent = {
  template: `
    <div v-if="isPending">loading...</div>
    <div v-else-if="data">data:{{data}}</div>
    <div v-else-if="error">error:{{error.message}}</div>
  `,
  props: {
    id: [Number]
  },
  setup(props){
    const data = ref(null)
    const error = ref(null)
    const isPending = ref(true)

    function getData(id) {
      isPending.value = true
      setTimeout(() => {
        data.value = {
          text: 'success',
          id: id
        }
        isPending.value = false
      }, 500)
    }

    getData(props.id)
    
    watch(() => props.id, (newId, oldId) => {
      getData(newId)
    })

    return {
      data,
      error,
      isPending
    }
  }
}

const App = {
  components: { PostComponent },
  template: `
    <post-component :id="id"></post-component>
    <button @click="changeID">change ID</button>
  `,
  setup() {
    const id = ref(1)
    function changeID() { id.value++ }
    return { id, changeID }
  }
}
```

这样实现了变更后的需求。

### 存在的问题
- 当前的 `PostComponent` 模板和逻辑是耦合的，若其它地方需要不同的交互或 UI 则需要重写一份

### 解决问题
由于 `Composition API` 的存在，我们可以自由抽离逻辑。现在我们把获取数据的代码抽离，修改代码如下：
```js
function usePost(id) {
  const data = ref(null)
  const error = ref(null)
  const isPending = ref(true)

  function getData(id) {
    // ...
  }

  getData(id)

  // (*)
  watch(() => id, (newId, oldId) => {
    getData(newId)
  })

  return {
    data,
    error,
    isPending
  }
}

const PostComponent = {
  // ...
  setup(props) {
    let { data, error, isPending } = usePost(props.id)

    return {
      data,
      error,
      isPending
    }
  }
}

const App = {
  // ...
}
```
这样看起来视图和逻辑是分离的，但是注意 `usePost` 中 `(*)` 部分，我们传进来的 `id` 现在只是一个字符串，所以这里的 `watch` 并不会生效。为了使其生效，我们需要把传入的 `id` 改成从一个函数中获取，如下所示：
```js
function usePost(getID) { // (*)
  const data = ref(null)
  const error = ref(null)
  const isPending = ref(true)

  function getData(id) {
    // ...
  }

  getData(getID())

  // (*)
  watch(() => getID(), (newId, oldId) => {
    getData(newId)
  })

  return {
    data,
    error,
    isPending
  }
}

const PostComponent = {
  // ...
  setup(props) {
    let { data, error, isPending } = usePost(() => props.id) // (*)

    return {
      data,
      error,
      isPending
    }
  }
}
```

现在 `watch` 生效了。

## 使用 Composition API 
Vue 3 提供了一个 `watchEffect` 的方法，和我们之前实现的 `effect` 方法一样。

> 立即执行传入的一个函数，并响应式追踪其依赖，并在其依赖变更时重新运行该函数。

```js
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> 打印出 0

setTimeout(() => {
  count.value++
  // -> 打印出 1
}, 100)
```

我们的代码正好就是立即执行 `getData`，在其依赖 `id` 变更时重新执行 `getData`，所以我们可以使用 `watchEffect` 来继续改写代码，做到 `id` 变化时自动触发更新列表的操作。具体实现如下：
```js
function usePost(getID) {
  const data = ref(null)
  const error = ref(null)
  const isPending = ref(true)

  function getData(id) {
    // ...
  }

  watchEffect(() => {
    getData(getID())
  })

  return {
    data,
    error,
    isPending
  }
}
```

至此我们通过一个实例了解了 Vue 组合式 API 的灵活性，希望这对你的实际开发有所帮助。
