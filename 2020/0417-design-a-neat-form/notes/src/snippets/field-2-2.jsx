import React, { useReducer } from 'react'

const TYPES = {
  CHANGE: 'CHANGE',
}

const Field = ({ store, dispatch, name, children }) => React.cloneElement(children, {
  value: store[name],
  onChange: (e) => dispatch({
    type: TYPES.CHANGE,
    name,
    value: e.target.value,
  })
})

export default ({ onSubmit }) => {
  const [store, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case TYPES.CHANGE: {
        return {
          ...state,
          [action.name]: action.value,
        } 
      }
      default: {
        return state
      }
    }
  }, {})

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(store)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field store={store} dispatch={dispatch} name="username">
        <input placeholder="username" />
      </Field>
      <Field store={store} dispatch={dispatch} name="password">
        <input placeholder="password" />
      </Field>
      <Field store={store} dispatch={dispatch} name="captcha">
        <input placeholder="captcha" />
      </Field>
      <button>Submit</button>
    </form>
  )
}
