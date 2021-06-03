---
theme: seriph
background: https://source.unsplash.com/qDgTQOYk6B8/1920x1080
class: 'text-center'
highlighter: shiki
info: |
  ## Introducting Forte
---

# Forte

Schema-driven React form engine

<!--
本次分享的内容主要来自于最近半年在 TKEx 项目中针对复杂表单场景的实践，
我们在这些实践当中提取了通用的、存在共性的部分，并不断演进
其目前阶段的结果就是本次的分享主题 —— Forte

去年差不多也是这个时候，我在组内也做了一次关于 React 表单场景的分享。
其中介绍主流表单方案的设计思路和基本原理，也介绍了来自 antd 底层的 rc-field-form，
这个库目前在 GitHub 有 400+ stars，NPM 周下载量大概在 410k 左右，
这个数据的表现与大部分用户只知道 antd 但不了解 rc-field-form 本身有关，
下载量可以代表实际使用情况，也就意味着该库在一定程度上是满足了大部分用户场景的需求的。
-->

---
layout: quote

---

# Controlled Component 

> In HTML, form elements such as `<input>`, `<textarea>`, and `<select>` typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with setState().  
> We can combine the two by making the React state be the “single source of truth”. Then the React component that renders a form also controls what happens in that form on subsequent user input.

[Read more](https://reactjs.org/docs/forms.html#controlled-components)

<!--
部分新同学没有参与去年的分享，所以我们在这里简要地回顾一点基础概念。

首先，聊 React表单时必须要聊的，是 Controlled Component。

React 官方文档中有专门的一个篇幅用于介绍 Controlled Component。
与之相对的是 Uncontrolled Component。
从表现上说，Controlled Component 需要 coder 为组件设置 value 与 onChange 属性，
而 Uncontrolled Component 则由组件自身控制其状态，有的还会暴露 defaultValue 属性。
但从根本上说，Controlled Component 的核心是单一数据源 —— single source of truth。

以 input 组件为例，单一数据源指的是该输入框的值只由 React 控制，
这也就是为什么 Controlled Component 需要 value 和 onChange 属性的原因，
Value 是 React 控制组件值的通道；onChange 是告诉组件不要对用户的操作妄自行动，而是要委托给传入的 handler 来决定下一步该做什么。
-->

---

# Controlled Component 

<div v-click="2">

```tsx
const Field = ({ name,  children }) => {
  const form = React.useContext(FormContext)
  const { value, onChange } = form.control(name)
  return React.cloneElement(children, { value, onChange })
}
```

</div>

<div class="grid grid-cols-2 gap-x-4"><div>

### Native Controlled Component

```tsx {2,9-11}
const Search = ({ onSearch }) => {
  const [keyword, setKeyword] = React.useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ keyword })
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={keyword}
        onChange={e => setKeyword(e.target.value)} />
    </form>
  )
}
```

</div><div v-click="1">

### RC-Field-Form

```tsx {8-10}
import { Form, Field } from 'rc-field-form'

const Search = ({ onSearch }) => {
  const handleFinish = ({ keyword }) =>
    onSearch({ keyword })
  return (
    <Form onFinish={handleFinish}>
      <Field name="keyword" rules={rules}>
        <input />
      </Field>
    </Form>
  )
}
```

</div></div>

<!--
根据 Controlled Component 的设定，React 程序员通常会用这种方式编写一个表单

/

主流表单库通常会简化前面例子中啰嗦的部分，
例如 rc-field-form 提供了 Field 组件，
通过 name 属性决定字段在表单状态中存储的位置，
并省略 value 和 onChange —— 让这个看起来是非受控组件的组件实际受控，
甚至基于这个组件的设定，还可以扩展出诸如校验规则属性，帮助用户归纳校验器的代码。

/

而 Field 组件的实现原理，则可以简单理解为 Context 与 cloneElement 的结合。
首先通过上下文读取表单状态集中管理的实例，然后用 cloneElement 向子组件注入 value 和 onChange，
而这两个属性内部则是通过前面的表单实例所暴露的 API 实现实例与组件状态的双向同步。

正如前面所说，这个方案能够支撑绝大部分场景。
表单字段数量只要在一个合理的范围内，例如十个、二十个以内，这个方案都没有什么问题，可以写得非常清爽。
如果大于这个合理范围，要么你是在做一个面向专业领域的产品，要么你需要思考这个产品是否本身设计出了问题。

在最近半年到一年内，我在我所负责的 TKEx 项目中，就经常会遇到一些特别复杂的场景，
这确实是面向专业领域的产品，所以有些场景是无法避免的，
在这些复杂场景中，我们遇到一些难以解决的问题。
-->

---

# Problems encountered in real-world scenarios

```tsx {all|5|4|10|all}
export const ServiceForm = () => {
  return (
    <Form>
      {(form) => {
        const isHealthCheckEnabled = form.getFieldValue(['healthCheck', 'isEnabled'])
        return <>
          <Field name={['healthCheck', 'isEnabled']} label="心跳上报">
            <Switch />
          </Field>
          {isHealthCheckEnabled && (
            <Field name={['healthCheck', 'ttl']} label="TTL (秒)">
              <Input placeholder="请输入心跳上报 TTL 秒数" />
            </Field>
          )}
        </>
      }}
    </Form>
  )
}
```

<div v-click>

Render-Props will slow down rendering as the number of child nodes increases.

</div>

<!--
首先第一个例子。
这是一个简化后的服务配置表单，
我们提供一个是否开启心跳检查的选项，
开启时需要用户输入心跳检查的 TTL (Time To Live) 值，即生存时间。

/

具体到实现上，
我们需要读取 healthCheck.isEnabled 在表单实例状态中的值，

/

而表单实例需要通过 Form 组件的 render props 读取，

/

读取后在 TTL 字段组件前做条件检查，

/

从而实现了预期的条件渲染。

但纵观全局，我们发现获取表单实例的成本高昂。

我们从根级别的 Form 组件的 render props 获取表单实例，
由于表单实例中发生状态变化时，render props 会重新执行，
所以保证了我们拿到的 healthCheck.isEnabled 永远是最新的值。

/

但随着字段增多、或无关子组件的渲染复杂度增加，render props 重新执行的成本也在增加，
在上面的例子中，无需关心其它字段状态的「独立」节点也在不断重新渲染。

总结则是，随着子节点的增多，Render-Props 的速度会变慢。 
-->

---

# Problems encountered in real-world scenarios

```tsx {3|2|all}
export const ServiceForm = () => {
  const [form] = useForm()
  const isHealthCheckEnabled = form.getFieldValue(['healthCheck', 'isEnabled'])
  return (
    <Form form={form}>
      <Field name={['healthCheck', 'isEnabled']} label="心跳上报">
        <Switch />
      </Field>
      {isHealthCheckEnabled && (
        <Field name={['healthCheck', 'ttl']} label="TTL (秒)">
          <Input placeholder="请输入心跳上报 TTL 秒数" />
        </Field>
      )}
    </Form>
  )
}
```

<div v-click>

Using the hoisted context to access the form instance won't help either.

</div>

<!--
如果不是 Render-Props 呢？

这个案例里我们还是通过表单实例读取 healthCheck.isEnabled 的值，但不通过 render props。

/

RC-Field-Form 提供了 useForm 的 hooks，用于提前创建表单实例，
我们后面需要将这个实例传入给 Form 组件。

/

那么这个方案解决了我们的问题吗？

/

答案是没有的。
通过提升上下文来获取表单实例，对我们的问题而言没有任何帮助，
Form 组件下的子节点还是会随表单实例的状态变化不断重新渲染。
-->

---

# Problems encountered in real-world scenarios

```tsx {14|2-11|11}
export const ServiceForm = ({ services }: { services: IService[] }) => {
  const rules = React.useMemo(() => [
    () => ({
      validator: async (_, name) => {
        if (!services) {
          return;
        }
        assert(services?.every(service => service?.name !== name), `已存在名称为 ${name} 的 Service`);
      },
    }),
  ], [services]);
  return (
    <Form>
      <Field name="name" label="服务名称" rules={rules}>
        <Input type="text" placeholder="请输入服务名称" />
      </Field>
    </Form>
  )
};
```

<div v-click>

How to trigger validation that depends on the state outside the form when the dependency changes?

</div>

<!--
接下来，我们为字段设置校验规则。

/

在这个场景中，我们的校验规则不是常见的字符长度、正则检查，
而是重名检查。

我们将用户输入的 Service 名称与从接口查询的 Services 列表一一比对，如果发现重复则做拦截。
这里不具体展开如何查询，我们仅假设 Services 列表在父级组件中已经准备好了，通过属性传入到当前组件。

由于 services 列表是属性或状态，所以我们需要用 useCallback 或 useMemo 包裹校验函数

/

并将 services 作为依赖项。

至此我们的实现看起来都没有任何差错，但事实上，有一种场景没有被我们覆盖到。

/

如果 services 列表发生了变化，我们要如何触发校验器重新执行？
-->

---

# Problems encountered in real-world scenarios


```tsx {1-7|5|9,11-18|10|10,12,15}
export const ServiceForm = () => {
  const [form] = useForm()
  return <Form form={form}>
    <BasicForm form={form} />
    <HealthCheckForm form={form} />
  </Form>
}

export const HealthCheckForm = ({ form }: { form: FormInstance }) => {
  const isEnabled = form.getFieldValue(['healthCheck', 'isEnabled'])
  return <Body>
    <Field name={['healthCheck', 'isEnabled']} label="心跳上报">
      <Switch />
    </Field>
    <Field name={['healthCheck', 'ttl']} label="TTL (秒)">
      <Input placeholder="请输入心跳上报 TTL 秒数" />
    </Field>
  </Body>
}
```

<div v-click>

Can we omit redundant prefix paths in nested components?

</div>

<!--
下一个问题。

在特别复杂的表单的场景里，我们可能会一不小心就写出很长的代码。
习惯比较好的同学，特别是熟悉函数式编程的同学，很快就开始试图将代码解藕，拆细。

例如这里我们将 Service 表单拆分为基本信息表单和健康检查表单。

/

以健康检查表单为例

/

我们在该表单内定义了所需要的字段，

/

然后通过实例方法读取需要的字段状态

/

但我们很快发现，为了实现拆分，保证该表单仅操作自己命名空间下的字段，
我们需要手动地为每个字段路径添加前缀。

/

那么我们是否可以省略这些重复且啰嗦的前缀呢？

在过去的这段经历中，我们针对以上种种问题在项目内对 rc-field-form 进行了二次开发，
例如我们支持了表单嵌套的能力。
同时我们也发现，有些问题可以由主流库自身迭代优化解决，但也有一些从设计策略上就决定了无法被解决。

因此大概在年前，我开始着手重新设计一套符合我们需求的表单引擎。

也就是 Forte。
-->

---

# What is Forte?

Forte is a Schema-driven React form engine, designed for decoupling and componentization.

- 🧩 Schema Driven
- 🏎️ Performance First
- 📏 Validation
- 👯 Efficient List
- 🪆 Scope Componentization
- 🪝 React Hooks Integration
- 💭 Type Infering

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #146b8c 20%, #4EC5D4 10%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;
}
</style>

<!--
什么是 Forte?
如果用最简洁的话描述 —— Forte 是一个 (Schema) 模式驱动的 React 表单引擎，为解藕和组件化而设计。

其最重要的核心是「以 Schema 驱动」。
这是一种策略上的倾向，决定了 Forte 在某些场景下特别适用，在其它某些场景下又显得非常笨重。

其次 Forte 是性能优先的。
它从内部帮助用户提前消除许多表单场景中潜在的性能问题。
这意味着在大型表单的场景中，我们可以更专注于实现产品业务本身。

然后 Forte 也和其它主流表单库一样，有着一套校验器方案，
其中包括内置常见的校验规则，也支持自定义扩展，并天然支持异步校验。
而且，就像前面提到的，Forte 的校验器也是性能优先的。

接着 Forte 也提供一套高效的表单列表方案。
也支持基于 Scope 子域的表单组件化 —— 这就是前面提到的嵌套场景。

此外 Forte 面向 React 16.8 以上版本，深度集成了 React Hooks，实现了更精确的状态维护。

最后，Forte 也面向 TypeScript，甚至基于 TS 4.1 支持了大部分主流库还欠缺的基于字段路径的类型推导。
-->

---

# Basic Usage

```tsx {all|3-6|13,17|14-15|9,13,17}
import { Form, Field, Schema as S } from '@fortejs/forte'

const FormSchema = S.Form({
  username: S.Field<string>(),
  password: S.Field<string>(),
})

export const App = () => {
  const handleSubmit = React.useCallback(values => console.log(values), [])
  return (
    <>
      <h3>Login</h3>
      <Form schema={FormSchema} onSubmit={handleSubmit}>
        <Field path="username">{control => <input placeholder="Username" {...control} />}</Field>
        <Field path="password">{control => <input placeholder="Password" type="password" {...control} />}</Field>
        <input type="submit" />
      </Form>
    </>
  )
}
```

<!--
使用 Forte 的方法非常简单，我们用以下示例说明。

/

首先我们需要通过 Forte 暴露的 Schema 工具定义出表单模型

/

然后将该模型传入给 Form 组件

/

在 Form 组件的子节点中，使用 Field 组件挂载表单模型中的字段，
Field 组件将通过 render props 向下传递 control 对象，该对象实际上就是 value 和 onChange。
最后输入组件展开 control 作为属性。
这部分做法和主流库是类似的。

在实际项目中，你可以结合你的 UI 库对 Field 进行二次封装，简化展开 control 以及状态展示的代码。

这里为了演示清晰，我们不过多地做优化。

/

接着 Form 组件接受 onSubmit 属性，
与普通的 onSubmit 不同，
Forte 的 onSubmit 将传入与模型定义相符的数据结构，
方便我们做后续的操作，例如提交接口等。
-->

---

# Componentization

<div class="grid grid-cols-2 gap-x-2"><div><div v-click>

```tsx
import { FormScope, Field, S } from '@fortejs/forte'
import { PolarisFormSchema, PolarisForm } from './polaris'

const ServiceFormSchema = S.Form({
  name: S.Field<string>(),
  polaris: PolarisFormSchema,
})

export const ServiceForm = () => {
  const handleSubmit = React.useCallback(values =>
    console.log(values)
  , [])
  return (
    <Form schema={ServiceFormSchema} onSubmit={handleSubmit}>
      <Field path="name">{control =>
        <input placeholder="service name" {...control} />
      }</Field>
      <FormScope path="polaris">
        <PolarisForm />
      </FormScope>
    </Form>
  )
}
```

</div></div><div>

```tsx
import { Field, S } from '@fortejs/forte'

export const PolarisFormSchema = S.Scope({
  name: S.Field<string>(),
  token: S.Field<string>(),
})

export const PolarisForm = () => {
  return (
    <>
      <Field path="name">{control =>
        <input placeholder="polaris name" {...control} />
      }</Field>
      <Field path="token">{control =>
        <input placeholder="polaris token" {...control} />
      }</Field>
    </>
  )
}
```

</div></div>

<!--
前面提到的基于子域的表单组件化是什么呢？

我们在 Forte 中提供了模型工具 S.Scope 以及组件 FormScope，
例如这里我们先定义了一个小型表单的结构，也实现了对应的组件，
与前面例子的区别是，这里我们使用的 S.Scope 包裹整个模型，而不是 S.Form，
另外我们也没有在组件中使用 Form 组件。

/

接着我们实现一个完整的表单，并引用刚编写的小型表单。
这样便能很轻松地实现表单的解藕和组件化。
-->

---

# Validation with builtin predicates

```tsx
export const ServiceFormSchema = S.Scope({
  name: S.Field<string>({
    defaultValue: '',
    rules: [
      ['string/required', []],
      ['string/max', [1000]],
      ['string/pattern', [/^[a-z]([-a-z0-9]*[a-z0-9])?$/]],
    ],
  }),
})
```

<!--
校验器也是 Forte 比较重要的一个特性。

我们提供了常见的十多个内置校验规则，
而校验规则是在模型中定义，而不是像其它库，通过组件属性传入。

例如这里的例子，我们同时使用了多条内置校验规则，
每条校验规则的第一个参数是内置规则名，第二个参数是规则参数列表。
-->

---

# Validation with dependencies

```tsx {all|2,8-18|2,8}
export const ServiceFormSchema = S.Scope({
  name: S.Field<string, [IService[], INamespace]>({
    defaultValue: '',
    rules: [
      { predicate: ['string/required', []], lazy: true },
      { predicate: ['string/max', [1000], lazy: true },
      { predicate: ['string/pattern', [/^[a-z]([-a-z0-9]*[a-z0-9])?$/]], lazy: true },
      async (value, [services, namespace]) => {
        assert(
          !services?.some(
            service =>
              service?.name === value &&
              service?.namespace?.name === namespace?.name &&
              service?.namespace?.cluster?.id === namespace?.cluster?.id
          ),
          `同集群同命名空间下已存在名称为 ${value} 的 Service`
        )
      },
    ],
  }),
})
```

<!--
在更复杂的场景里，我们也支持自定义校验器，
对于所有规则，包括内置和自定义，Forte 都支持懒校验，

什么是懒校验？简单说就是仅当表单提交前才做检查；反之则是每次变化时，以及依赖变化时，均进行检查。

/

这个例子还使用了联动检查的特性。
主流库通常只考虑了表单内字段联动的检查，
但我们经常会遇到表单外状态的联动，例如前面有提到的重名检查。

在 Forte 中实现联动检查，你需要在定义模型时将依赖项提前通过泛型参数声明，

/

然后便可以在自定义校验器中使用。
-->

---

# Validation with dependencies

```tsx{all|3|4|8}
import { Form, Field } from '@fortejs/forte'

const ServiceForm = ({ namespace }: { namespace: INamespace }) => {
  const { services } = React.useContext(ServicesContext)

  return (
    <FormScope>
      <Field path="name" dependencies={[services, namespace]}>
        <Input type="text" placeholder="请输入服务名称" />
      </Field>
    </FormScope>  
  )
}
```

<!--
那么依赖项的数据从哪里来呢？

/

事实上依赖项可以是属性

/

也可以是状态

/

甚至其它值，例如常量。
我们通过 Field 组件的 dependencies 属性传入。

因此 Forte 的联动校验比主流库更灵活。
-->

---

# Validation with dependencies

```tsx{all|5|10|14|all|10}
import { Form, Field, useForteValue } from '@fortejs/forte'

export const ServiceFormSchema = S.Scope({
  name: S.Field<string, [IService[], INamespace]>({ /** ... */ }),
  namespace: S.Field<INamespace>({ /** ... */ }),
})

const ServiceForm = () => {
  const { services } = React.useContext(ServicesContext)
  const namespace = useForteValue('namespace')

  return (
    <FormScope>
      <Field path="name" dependencies={[services, namespace]}>
        <Input type="text" placeholder="请输入服务名称" />
      </Field>
      <Field path="namespace">
        <NamespaceSelect />
      </Field>
    </FormScope>  
  )
}
```

<!--
而回到一般主流库支持的表单内字段联动检查，也不在话下。

/

例如我们表单中有 namespace 字段

/

在表单组件中通过集成的 React hooks —— useForteValue 读取该字段的值

/

然后传递给对应 Field 组件的 dependencies 属性

/

完整的联动逻辑就实现了。

/

我们刚刚提到了 useForteValue。
和 rc-field-form 不同，我们不是直接拿到表单实例，然后通过 api 读取其中字段的值，
而是通过一个 react hooks 实现。
-->

---

# Using Hooks with Subscription

<div class="grid grid-cols-2 gap-x-4"><div><div v-click>

![](/images/get-value-from-context.png)

</div></div><div><div v-click>

![](/images/get-value-from-hooks.png)

</div></div></div>

<!--
有意思的是，实际上我们是通过订阅模型实现了这个 React Hooks，而不是基于常见 useState。

这里不过多地展开，
但如果要用一个比较容易理解的说法解释这一点，
可以说，我们需要在外部管理一套状态，所以在这个层面我们做了和 Redux 相似的事情。

那么理清这里的逻辑之后，我们再去对比这两种风格的性能差异

/

受前面章节提到的主流库 render props 重复渲染的问题影响，
在实际应用中，修改一个输入框的值后，我们的页面需要 11ms 进行重新渲染。

/

而在 Forte 使用 React Hooks 的这套方案中，
同样的操作，我们需要 6ms。

这其中包含了一些确实存在的联动变更。
-->

---

# Big lists are dangerous

```tsx {all|2|8,10|9|3-5|9}
const App = () => {
  const [names, setNames] = React.useState<string[]>([])
  const setName = React.useCallback((value: string, index: number) => {
    setNames([...names.slice(0, index), value, ...names.slice(index + 1)])
  }, [names])
  return (
    <>
      {names.map((name, index) => (
        <Input key={String(index)} value={name} onChange={value => setName(value, index)} />
      ))}
    </>
  )
}

```

<div v-click>

Since `setName` functions always change with any names change, using key prop does not reduce redundant re-rendering.

</div>

<!--
Forte 针对表单中列表的场景也做了专门的优化。

例如，这是一个不使用任何第三方库的列表编辑页。

/ 

我们定义一个名为 names state，用于管理列表的状态

/

通过 names.map 遍历并生成一个个输入框，

/

然后我们为每个输入框都加上 key，并将对应的 name 值传入 value 属性

/

再基于 setNames 定义一个用于修改指定项值的 setName 函数

/

最后将这个 setName 作为 onChange 属性传入输入框组件。

看起来很好！

但这个实现方式隐藏着一个巨大的性能隐患。

/

由于 names 变化后 setName 函数也在发生变化，
所以即便加了 key，只要某一个输入框的值发生变化，所有输入框都将重新渲染。

在 Forte 当中，我们通过「劫持」列表，做了一些特殊的优化。
-->

---

# List Hijacking 

![](/images/native-list-change-performance.png)

<div v-click>

![](/images/forte-list-change-performance.png)

</div>

<!--
我们基于上面例子，生成了 500 个输入框，

这是单输入框值发生变化时的燃尽图，
也就是用户每次敲下一个字，React 就需要 22ms 重新渲染这个页面。

由于示例是很单纯的 input 框，实际场景中可能还有更多的节点需要渲染，所以这个耗时在实际场景中理论上会更高。

/

那么通过使用被 Forte 劫持的列表后，
同样的页面可以优化到非常精确地更新，只需要 1ms。
-->

---

# List Usage

```tsx {all|3-5|7|13,20|14,19|14,16,19|14,17,19|10,12,21,22|all}
import { Form, Field, FormList, S } from '@fortejs/forte'

const FormSchema = S.Form({
  tags: S.List({ name: S.Field<string>({ defaultValue: '' }) }),
})

const TagForm = React.memo(() => <Field path="name">{control => <input placeholder="name" {...control} />}</Field>)

export const App = () => {
  const handleSubmit = React.useCallback(values => console.log('submit', values), [])
  return (
    <Form schema={FormSchema} onSubmit={handleSubmit}>
      <FormList path="tags">
        {({ map, push }) => (
          <>
            {map(() => <TagForm />)}
            <button type="button" onClick={() => push({ name: '' })}>+ Add</button>
          </>
        )}
      </FormList>
      <button type="submit">Submit</button>
    </Form>
  )
}
```

<v-clicks>
<arrow x1="500" y1="340" x2="330" y2="380" color="#3b82f6" width="3" />
<div class="fixed top-80 left-130 text-blue-500 text-lg">No keys requierd</div>
</v-clicks>

<!--
那么所谓的劫持究竟是什么呢？

我们用一个列表的示例来说明。

/

首先我们定义表单模型中存在一个名为 tags 的编辑列表

/

然后对应地实现 tags 子表单组件，
为了演示方便，这里只用了一个 Field，
实际上你也可以使用更多 Field。

/

在表单中，我们通过 FormList 组件挂载列表节点

/

该组件是一个 render props，并暴露 map, push 等常见的列表操作方法

/

我们通过 map 为每个项挂载一个 tags 子表单组件

/

然后使用 push 实现追加更多项的功能。

/

最后就和普通的 Forte 表单一样，将 Schema 传给 Form 组件，并通过 onSubmit 获取表单提交的值。

/

这就完成了表单中编辑列表的功能。

这里的 map 实际上并不是真正的 array.prototype.map, push 也不是。
实际上 List 的底层是通过链表实现的，
因此，插值删值也是 Forte 擅长的领域。

/

你可能还发现了

/

这里我们没有为列表中的项设置 key，

事实上我们确实不需要设置，
因为这里的 map 是被劫持的 map，Forte 会自动为每个项插入其在链表中对应的 ID
-->

---
layout: quote
---

> - In a UI, it's not necessary for every update to be applied immediately; in fact, doing so can be wasteful, causing frames to drop and degrading the user experience.
> - Different types of updates have different priorities — an animation update needs to complete more quickly than, say, an update from a data store.
> - A push-based approach requires the app (you, the programmer) to decide how to schedule work. A pull-based approach allows the framework (React) to be smart and make those decisions for you.

[React Fiber Architecture - Scheduling](https://github.com/acdlite/react-fiber-architecture#scheduling)

<!--
在写 Forte 的过程中，我也阅读了许多资料，
其中有一些很有意思，会让人有所启发。

例如，
在 React Fiber 介绍 Scheduling 的文档中，
有这么一段关于 React 设计原则的话。

首先，在 UI 中，并非所有的更新都应该立即执行，我们甚至应该减少一些不必要的执行。
其次，不同的更新类型应该有不同的优先级。
最后，启发式的框架应更聪明地为用户做决定。
-->

---

> Mostly backwards compatibility reasons. The Node.js team can't break the whole ecosystem.
> 
> It also allows silly code like this:
> ```
> let unicorn = false;
> 
> emitter.on('🦄', () => {
> 	unicorn = true;
> });
>
> emitter.emit('🦄');
> 
> console.log(unicorn);
> //=> true
> ```
> 
> But I would argue doing that shows a deeper lack of Node.js and async comprehension and is not something we should optimize for. The benefit of async emitting is much greater.

[sindresorhus/emittery - Isn't EventEmitter synchronous for a reason?](https://github.com/sindresorhus/emittery#isnt-eventemitter-synchronous-for-a-reason)

<!--
其次在 sindresorhus 的一个库，emittery，当中，
我们发现由于历史设计原因，Node.js 中的 EventEmitter 并非异步。
-->

---

# EventEmitter, Sync or Async

[sindresorhus/emittery](https://github.com/sindresorhus/emittery)

<div v-click>

![](/images/sync-validation.png)

</div>

<div v-click>

![](/images/async-validation.png)

</div>

<!--
而我们前面提到， Forte 内部实现了一套基于订阅模式实现的状态管理。

我突然意识到，这里其实还有很大的优化空间。

我们将 Forte 订阅模型底层的 EventEmitter 拆分为立即和异步的两种策略。
状态值的变更为立即触发，
校验器则为异步触发，甚至内置 debounce 做更进一步的优化策略。

/

通过比对可以看到，优化前一次变更可能会出现一帧 66ms，

/

优化后，所有的校验操作被打散，总时长与优化前相近，但卡帧消失了。
-->

---

# Type Infering

[TypeScript 4.1 - Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)

<div v-click>

![](/images/type-infering.png)

</div>

<!--
最后 Forte 还有一个有趣的特性，
基于字段路径的类型推导。

这是 TS 4.1 后得到的能力，也确实帮助我们发现了实际的问题。
-->

---

# Which one should I choose?

<div class="grid grid-cols-2 gap-x-4"><div>

<v-click>

## Redux(-like)

### Pros

</v-click>

<v-clicks>

- 🏎️ Good Performance

</v-clicks>

<v-click>

## RC-Field-Form(-like)

### Pros

</v-click>

<v-clicks>

- 🎨 Designed for Form

</v-clicks>

</div><div>

<v-click>

## Forte

### Pros

</v-click>

<v-clicks>

- 🏎️ Good Performance
- 🎨 Designed for Form
- 🪆 Scope Componentization
- 💭 TypeScript Support

</v-clicks>

<v-click>

### Cons

</v-click>

<v-clicks>

- 🧱 Schema Required

</v-clicks>

</div></div>

<!--
如果从技术选型的角度分析，
在不同方案之间，各有什么优劣，我们应该如何选择呢？

...

为表单设计意味着更容易上手，代码更简洁，像校验器等逻辑也更容易被归纳和简化。
-->

---
layout: center
---

# Example

---
layout: cover
background: /images/dogfooding-tkex-service.png
---

[TKEx-CSIG](https://git.woa.com/STKE/tkex-web)

<!--
Dogfooding
-->

---

# Roadmap

- 💂 Higher test coverage *(currently 85%)*
- 🚌 New EventEmitter Provider
- 📖 Better Documents
- 💭 Better Type Infering

---
layout: center
---

# Learn More

- [Repo](https://git.woa.com/yelozyhuang/forte)
- [Document (WIP)](https://www.notion.so/imyelo/Guide-387c3c259723497f8ad480ab6b153c34)
  