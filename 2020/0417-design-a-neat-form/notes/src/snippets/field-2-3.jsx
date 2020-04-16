import React, { useContext, useReducer } from 'react'

const TYPES = {
  CHANGE: 'CHANGE',
}

const FormContext = React.createContext({})

const Form = ({ onSubmit, children }) => {
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

  return <form onSubmit={handleSubmit}>
    <FormContext.Provider value={[store, dispatch]}>
      {children}
    </FormContext.Provider>
  </form>
}

const Field = ({ name, children }) => {
  const [store, dispatch] = useContext(FormContext)
  return React.cloneElement(children, {
    value: store[name],
    onChange: (e) => dispatch({
      type: TYPES.CHANGE,
      name,
      value: e.target.value,
    })
  })
}

export default ({ onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      <Field name="username">
        <input placeholder="username" />
      </Field>
      <Field name="password">
        <input placeholder="password" />
      </Field>
      <Field name="captcha">
        <input placeholder="captcha" />
      </Field>
      <button>Submit</button>
    </Form>
  )
}
