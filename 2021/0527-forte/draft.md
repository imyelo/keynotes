---

# Problems encountered in real-world scenarios

```tsx {10-12|9}
export const ServiceForm = () => {
  const [form] = useForm()
  const isHealthCheckEnabled = form.getFieldValue(['healthCheck', 'isEnabled'])
  return (
    <Form form={form}>
      <Field name={['healthCheck', 'isEnabled']} label="心跳上报">
        <Switch />
      </Field>
      {isHealthCheckEnabled && (
        <Field name={['healthCheck', 'ttl']} label="TTL (秒)" rules={[
          { type: 'number', max: 60, min: 2, transform: v => Number(v) },
        ]}>
          <Input placeholder="请输入心跳上报 TTL 秒数" />
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