import React from 'react'
import Loadable from 'react-loadable'
import chain from '@hspkg/chain'

const tea = (path) => {
  if (Array.isArray(path)) {
    return path.map((p) => tea(p))
  }
  return Loadable({
    loader: () => import('@tencent/tea-component'),
    loading: () => <div>Loading...</div>,
    render: (loaded, props) => {
      let Component = chain(loaded, path)
      return <Component {...props} />
    },
  })
}

export default tea
