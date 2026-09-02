// Shared helpers for the data shape returned by
// annual_budget.api.foundation_consolidated_report.get_unit_wise_plan_budget
// and annual_budget.api.phase_sheet.get_combined_actuals - both return a
// tree of {name, sub_heads[], items[]} nodes, but leaf amounts differ:
// the unit-wise endpoint carries a flat `ytd` number per node, while the
// combined-actuals endpoint carries `ytd` (budget) AND
// `total_posted_amt_ytd` (actual) side by side. These accessors read
// either shape without the caller needing to know which one it has.
export function nodeBudget(node) {
  return Number(node?.ytd || 0)
}

export function nodeActual(node) {
  // Head/sub_head levels carry `total_posted_amt_ytd`; leaf `items[]` carry
  // the same actual value under `total_posted_amt` instead (no _ytd suffix)
  // - both are read here so a tree walk doesn't go to 0 the moment it
  // reaches item level (matches monthlyMisData.js's own itemVal() fallback
  // for the same two field names).
  return Number(node?.total_posted_amt_ytd ?? node?.total_posted_amt ?? 0)
}

// Sums a node's own value if it has no children, otherwise sums children -
// mirrors budgetTotals.js's rowTotal fallback pattern for synthetic nodes
// built client-side (e.g. a "Direct Work" node assembled from several
// items across heads).
export function treeTotal(node, accessor = nodeBudget) {
  const own = accessor(node)
  if (own) return own
  const children = node?.sub_heads?.length ? node.sub_heads : node?.items
  if (children?.length) return children.reduce((sum, child) => sum + treeTotal(child, accessor), 0)
  return 0
}

export function utilizationPct(node) {
  const budget = treeTotal(node, nodeBudget)
  const actual = treeTotal(node, nodeActual)
  return budget > 0 ? Math.round((actual / budget) * 100) : 0
}

// Desk page's exact thresholds: green under 60%, orange 60-100%, red over.
export function utilizationColor(pct) {
  if (pct > 100) return '#e34948'
  if (pct >= 60) return '#eda100'
  return '#1baf7a'
}

// Flattens every item (leaf) under a node whose name matches, wherever it
// sits in the sub_heads/items tree - used to pull out "Grants & Donations"
// line items for the Direct Work / Grants split.
export function findItemsByName(nodes, name) {
  const found = []
  function walk(node) {
    if (node.name === name && !node.sub_heads?.length && !node.items?.length) {
      found.push(node)
      return
    }
    for (const child of node.sub_heads || []) walk(child)
    for (const child of node.items || []) walk(child)
  }
  for (const node of nodes) walk(node)
  return found
}

// Same walk, but collects every leaf NOT matching name - the complement
// set used for "Direct Work" (everything that isn't Grants & Donations).
export function findItemsExcluding(nodes, name) {
  const found = []
  function walk(node) {
    const isLeaf = !node.sub_heads?.length && !node.items?.length
    if (isLeaf) {
      if (node.name !== name) found.push(node)
      return
    }
    for (const child of node.sub_heads || []) walk(child)
    for (const child of node.items || []) walk(child)
  }
  for (const node of nodes) walk(node)
  return found
}
