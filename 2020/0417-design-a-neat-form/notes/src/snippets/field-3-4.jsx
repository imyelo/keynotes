import React, { useContext, useReducer } from 'react'
import assert from 'assert'

const TYPES = {
  CHANGE: 'CHANGE',
}

const validators = {
  username: [
    (value) => assert(value, '请输入用户名'),
  ],
  password: [
    (value) => assert(value && value.length >= 6, '密码必须大于六位数'),
  ],
  captcha: [
    (value) => assert(value && value.length === 4, '验证码为四位数'),
  ],
}

const FormContext = React.createContext({})

const Form = ({ onSubmit, children }) => {
  const [store, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case TYPES.ERROR: {
        return {
          ...state,
          errors: {
            ...state.errors,
            [action.name]: action.error,
          },
        } 
      }
      case TYPES.CHANGE: {
        return {
          ...state,
          values: {
            ...state.values,
            [action.name]: action.value,
          },
        } 
      }
      default: {
        return state
      }
    }
  }, {
    errors: {},
    values: {},
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(store.values)
  }

  const wrapper = children({
    getFieldErrors () {
      return Object.values(store.errors).filter(Boolean)
    },
  })

  return <form onSubmit={handleSubmit}>
    <FormContext.Provider value={[store, dispatch]}>
      {wrapper}
    </FormContext.Provider>
  </form>
}

const Field = ({ name, validate, children }) => {
  const [store, dispatch] = useContext(FormContext)
  return React.cloneElement(children, {
    value: store[name],
    onChange: (e) => {
      const value = e.target.value
      try {
        validate.forEach((fn) => fn(value))
        dispatch({
          type: TYPES.ERROR,
          name,
          error: null,
        })
      } catch (error) {
        dispatch({
          type: TYPES.ERROR,
          name,
          error,
        })
      }
      dispatch({
        type: TYPES.CHANGE,
        name,
        value,
      })
    }
  })
}

export default ({ onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      {(form) => {
        const errors = form.getFieldErrors()
        return (
          <React.Fragment>
            <Field name="username" validate={validators.username}>
              <input placeholder="username" />
            </Field>
            <Field name="password" validate={validators.password}>
              <input placeholder="password" />
            </Field>
            <Field name="captcha" validate={validators.captcha}>
              <input placeholder="captcha" />
            </Field>
            <button>Submit</button>
            { errors.length > 0 ? <p className="error">{errors[0].message}</p> : null }
          </React.Fragment>
        )
      }}
    </Form>
  )
}
