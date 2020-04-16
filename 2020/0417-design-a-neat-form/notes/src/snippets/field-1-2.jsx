import React, { useState } from 'react'

const Field = ({ state, children }) => React.cloneElement(children, {
  value: state[0],
  onChange: (e) => state[1](e.target.value)
})

export default ({ onSubmit }) => {
  const state = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      value: state[0],
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field state={state}>
        <input />
      </Field>
    </form>
  )
}
