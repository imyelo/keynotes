import React from 'react'
import fromPairs from 'lodash/fromPairs'

const Search = ({ onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onSearch(fromPairs([...data.entries()]))
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="keyword" placeholder="请输入用户 AppID 或集群 ID 查询" />
    </form>
  )
}

export default Search
