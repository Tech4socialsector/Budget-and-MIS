// Evaluates Frappe's own `depends_on` DocField convention - the same
// mechanism desk itself uses: a string prefixed "eval:" is JS, evaluated
// with `doc` (and `parent`, for a child-table row) in scope, e.g.
// "eval:doc.age>14". Anything else is treated the way desk does for a bare
// fieldname - a truthy value (or a non-empty array, for a Table/Table
// MultiSelect) means "show".
const cache = new Map()

export function evaluateDependsOn(expression, values, parent) {
  if (!expression) return true
  if (typeof expression === 'boolean') return expression

  if (expression.startsWith('eval:')) {
    const code = expression.slice(5)
    let fn = cache.get(code)
    if (!fn) {
      try {
        // eslint-disable-next-line no-new-func
        fn = new Function('doc', 'parent', `let out = ${code}; return out`)
      } catch {
        return true
      }
      cache.set(code, fn)
    }
    try {
      return !!fn(values, parent)
    } catch {
      // A field referenced in the expression not existing yet (e.g. still
      // loading) shouldn't crash the form - default to hidden, same as a
      // thrown expression in desk falling through to a falsy result.
      return false
    }
  }

  const value = values?.[expression]
  if (Array.isArray(value)) return value.length > 0
  return !!value
}
