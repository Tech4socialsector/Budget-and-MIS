// Which columns a table shows, in what order and under what heading - the state
// behind the Columns picker (components/ColumnPicker.vue), shared by the main
// list (DoctypeList) and child tables (ChildTable).
//
// Saved per table in localStorage as { order: [fieldname...], labels:
// { fieldname: heading } }. `order` is null until the picker is first
// touched - the default is whatever `defaultColumns` is (the doctype's own
// list-view fields). Once set it is an explicit, ordered list over *every*
// field in `allFields`, so any field can be added, removed and dragged into
// place.
import { computed, ref } from 'vue'

function load(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) return { order: parsed, labels: {} }
    if (parsed && typeof parsed === 'object') {
      return { order: Array.isArray(parsed.order) ? parsed.order : null, labels: parsed.labels || {} }
    }
  } catch {
    /* unreadable - fall through to the default */
  }
  return { order: null, labels: {} }
}

export function useColumnPrefs({ storageKey, allFields, defaultColumns }) {
  const saved = load(storageKey)
  const columnOrder = ref(saved.order)
  const columnLabels = ref(saved.labels)

  const visibleColumns = computed(() => {
    const arranged = columnOrder.value
      ? columnOrder.value.map((name) => allFields.value.find((f) => f.fieldname === name)).filter(Boolean)
      : []
    const list = arranged.length ? arranged : defaultColumns.value
    return list.map((f) => (columnLabels.value[f.fieldname] ? { ...f, label: columnLabels.value[f.fieldname] } : f))
  })
  const hasCustomColumns = computed(() => !!columnOrder.value || Object.keys(columnLabels.value).length > 0)

  function persist() {
    try {
      if (hasCustomColumns.value) {
        localStorage.setItem(storageKey, JSON.stringify({ order: columnOrder.value, labels: columnLabels.value }))
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch {
      /* storage unavailable - the choice just won't persist */
    }
  }

  const currentColumnOrder = () => visibleColumns.value.map((c) => c.fieldname)
  function setColumnOrder(next) {
    columnOrder.value = next
    persist()
  }
  function removeColumn(fieldname) {
    const next = currentColumnOrder().filter((name) => name !== fieldname)
    // Never an empty table - keep at least one column.
    if (next.length) setColumnOrder(next)
  }
  function addColumn(fieldname) {
    setColumnOrder([...currentColumnOrder(), fieldname])
  }
  function moveColumn(from, to) {
    if (from == null || from === to) return
    const next = currentColumnOrder()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setColumnOrder(next)
  }
  function renameColumn(fieldname, label) {
    const labels = { ...columnLabels.value }
    const original = allFields.value.find((f) => f.fieldname === fieldname)?.label
    const text = (label || '').trim()
    if (!text || text === original) delete labels[fieldname]
    else labels[fieldname] = text
    // Make the current set explicit first so a rename doesn't silently re-derive it.
    if (!columnOrder.value) columnOrder.value = currentColumnOrder()
    columnLabels.value = labels
    persist()
  }
  function resetColumns() {
    columnOrder.value = null
    columnLabels.value = {}
    persist()
  }

  // Fields not currently shown, as options for "Add Column".
  const addableColumns = computed(() => {
    const shown = new Set(currentColumnOrder())
    return allFields.value
      .filter((f) => !shown.has(f.fieldname))
      .map((f) => ({ label: f.label || f.fieldname, onClick: () => addColumn(f.fieldname) }))
  })

  return {
    visibleColumns,
    hasCustomColumns,
    addableColumns,
    addColumn,
    removeColumn,
    moveColumn,
    renameColumn,
    resetColumns,
  }
}
