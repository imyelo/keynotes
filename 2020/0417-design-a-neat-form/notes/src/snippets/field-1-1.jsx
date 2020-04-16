import React, { useState } from 'react'

export default ({ onSubmit }) => {
  const [value, setValue] = useState('')
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      value,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </form>
  )
}
