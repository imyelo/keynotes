import React from 'react'
import styled from '@emotion/styled'
import { createSnackbar } from '@snackbar/core'
import Result from './common/result'

const Style = styled.section`
  border-radius: 4px;
  background-color: #fff;
  padding: 24px;
  font-size: 12px;
  form {
    margin: 0;
    padding: 0;
  }
  input {
    display: block;
    width: 100%;
    min-width: 320px;
    margin: 1em 0;
    padding: 1em;
    outline: none;
  }
  button {
    width: 100%;
    font-size: 14px;
    line-height: 3em;
    background-color: #fff;
    border: 1px solid #333;
  }
  .error {
    margin: 0;
    padding: 1em 1em 0;
    box-sizing: border-box;
    width: 100%;
    color: red;
  }
`

const log = (payload) => createSnackbar(JSON.stringify(payload), {
  timeout: 2 * 1000
})

const DefaultPreview = ({ name }) => {
  return (
    <Style>
      <Result name={name}>
        {(Snippet) => <Snippet onSubmit={(form) => log(form)} />}
      </Result>
    </Style>
  )
}

export default DefaultPreview
