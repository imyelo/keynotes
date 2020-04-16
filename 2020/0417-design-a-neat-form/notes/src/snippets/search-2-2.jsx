import React from 'react'

const Search = ({ onSearch }) => {
  const [keyword, setKeyword] = React.useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ keyword })
  }
  return (
    <form onSubmit={handleSubmit}>
      <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="请输入用户 AppID 或集群 ID 查询" />
    </form>
  )
}

export default Search
