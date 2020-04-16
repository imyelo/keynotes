const load = require.context('../../snippets', true, /^(\.\/)?[^_].*\.jsx$/)

const Result = ({ name, children }) => {
  const Component = load(`./${name}.jsx`).default
  return children(Component)
}

export default Result
