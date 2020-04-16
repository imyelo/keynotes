import React from 'react'
import styled from '@emotion/styled'
import { createSnackbar } from '@snackbar/core'
import Result from './common/result'

const Style = styled.section`
  border-radius: 4px;
  background-color: #fff;
  padding: 24px;
  font-size: 24px;
  form {
    margin: 0;
    padding: 0;
  }
  input {
    display: block;
    width: 100%;
    min-width: 640px;
    margin: 0;
    padding: 0.5em 1em;
    outline: none;
    font-size: 24px;
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

const SearchPreview = ({ name }) => {
  return (
    <Style>
      <Result name={name}>
        {(Snippet) => <Snippet onSearch={(form) => log(form)} />}
      </Result>
    </Style>
  )
}

export default SearchPreview
