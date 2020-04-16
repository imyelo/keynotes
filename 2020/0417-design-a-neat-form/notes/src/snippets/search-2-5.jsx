import React from 'react'

const normalize = v => v.trim()

/**识别输入的字符串为 AppID 或集群 ID */
const validateKeyword = (value) => Promise.resolve().then(() => {
  if (!value) {
    throw new Error('请输入关键词')
  }
  if (!value || /^(\d+$|cls-)/.test(value)) {
    return
  }
  throw new Error('输入有误，请输入以 cls- 开头的集群 ID 或数字类型的 AppID')
})

const Search = ({ onSearch }) => {
  const [keyword, setKeyword] = React.useState('')
  const [keywordError, setKeywordError] = React.useState(null)
  const handleSubmit = (e) => {
    e.preventDefault()
    validateKeyword(keyword)
      .then(() => {
        setKeywordError(null)
        onSearch({ keyword })
      }, (error) => {
        setKeywordError(error)
      })
  }
  return (
    <form onSubmit={handleSubmit}>
      <input value={keyword} onChange={e => setKeyword(normalize(e.target.value))} placeholder="请输入用户 AppID 或集群 ID 查询" />
      {keywordError ? <p className="error">{keywordError.message}</p> : null}
    </form>
  )
}

export default Search
