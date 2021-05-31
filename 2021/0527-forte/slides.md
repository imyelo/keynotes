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
一个强模型驱动的 React 表单引擎，为解藕和复用而设计。
-->

---
layout: quote

---

# Controlled Component 

> In HTML, form elements such as `<input>`, `<textarea>`, and `<select>` typically maintain their own state and update it based on user input. In React, mutable state is typically kept in the state property of components, and only updated with setState().  
> We can combine the two by making the React state be the “single source of truth”. Then the React component that renders a form also controls what happens in that form on subsequent user input.

[Read more](https://reactjs.org/docs/forms.html#controlled-components)

---

# Controlled Component 

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

</div><div v-click>

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

</div></div><div>

```tsx
const Field = ({ name,  children }) => {
  const form = React.useContext(FormContext)
  const { value, onChange } = form.control(name)
  return React.cloneElement(children, { value, onChange })
}
```

</div>

<!--
回顾 Controlled Component  
在该设定背景下业界通常会如何优化代码?  
最符合直觉的思路是结合 CloneElememt API 向受控组件自动注入 value & onChange, 实现表单内各字段的集中管理
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

---

# Problems encountered in real-world scenarios

```tsx {11-13|9}
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
          <Input placeholder="请输入心跳上报 TTL 秒数" rules={[
            { type: 'number', max: 60, min: 2, transform: v => Number(v) },
          ]} />
        </Field>
      )}
    </Form>
  )
}
```

<div v-click>

Should we verify fields that are not mounted?

</div>

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

---

# What is Forte?

Forte is a Schema-driven React form engine, designed for decoupling and componentization.

- 🧩 Schema Driven
- 🏎️ Performance First
- 📏 Validation
- 👯 Efficient List
- 🪆 Componentization
- 🪝 React Hooks Integration
- 🧠 Type Infering

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;
}
</style>

---

# Basic Usage

```tsx {all|3-6|13,17|14-15|9,13,17}
import { Form, Field, Schema as S } from '@yelo/forte'

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

---

# Componentization

<div class="grid grid-cols-2 gap-x-2"><div><div v-click>

```tsx
import { FormScope, Field, S } from '@yelo/forte'
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
      <FormScope path="polaris>
        <PolarisForm />
      </FormScope>
    </Form>
  )
}
```

</div></div><div>

```tsx
import { Field, S } from '@yelo/forte'

export const PolarisFormSchema = S.Form({
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

---

# Validation

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

---

# Validation

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

---

# Validation

```tsx{all,3,4,8}
import { Form, Field } from '@yelo/forte'

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

---

# Validation

```tsx{all|5|10|14}
import { Form, Field, useForteValue } from '@yelo/forte'

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

---
layout: center
---

# Example

---

# Big lists are dangerous

```tsx {all|2|9|3-5|9}
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


---

# Proxy List

![](/images/native-list-change-performance.png)

<div v-click>

![](/images/forte-list-change-performance.png)

</div>

---

# Using Hooks with Subscription

<div class="grid grid-cols-2 gap-x-4"><div>

![](/images/get-value-from-context.png)

</div><div><div v-click>

![](/images/get-value-from-hooks.png)

</div></div></div>

---
layout: quote
---

> - In a UI, it's not necessary for every update to be applied immediately; in fact, doing so can be wasteful, causing frames to drop and degrading the user experience.
> - Different types of updates have different priorities — an animation update needs to complete more quickly than, say, an update from a data store.
> - A push-based approach requires the app (you, the programmer) to decide how to schedule work. A pull-based approach allows the framework (React) to be smart and make those decisions for you.

[React Fiber Architecture - Scheduling](https://github.com/acdlite/react-fiber-architecture#scheduling)

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

---

# EventEmitter, Sync or Async

[sindresorhus/emittery](https://github.com/sindresorhus/emittery)

<div v-click>

![](/images/sync-validation.png)

</div>

<div v-click>

![](/images/async-validation.png)

</div>

---

# Type Infering

[TypeScript 4.1 - Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)

<div v-click>

![](/images/type-infering.png)

</div>

---
layout: cover
background: /images/dogfooding-tkex-service.png
---

[TKEx-CSIG](https://git.woa.com/STKE/tkex-web)

<!--
Dogfooding
-->

---
layout: center
---

# Learn More

- [Repo](https://git.woa.com/yelozyhuang/forte)