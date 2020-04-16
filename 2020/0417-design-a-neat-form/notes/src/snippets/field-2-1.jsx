import React, { useState } from 'react'

const Field = ({ state, children }) => React.cloneElement(children, {
  value: state[0],
  onChange: (e) => state[1](e.target.value)
})

export default ({ onSubmit }) => {
  const username = useState('')
  const password = useState('')
  const captcha = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      username: username[0],
      password: password[0],
      captcha: captcha[0],
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field state={username}>
        <input />
      </Field>
      <Field state={password}>
        <input />
      </Field>
      <Field state={captcha}>
        <input />
      </Field>
    </form>
  )
}
