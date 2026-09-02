import { computed } from 'vue'
import { useCall } from 'frappe-ui'

export function useMeta(doctype) {
  return useCall({
    url: `/api/v2/doctype/${doctype}/meta`,
    method: 'GET',
    cacheKey: `annual-budget-meta-${doctype}`,
  })
}

const SKIP_FIELDTYPES = new Set([
  'Section Break', 'Column Break', 'Tab Break', 'HTML', 'Heading', 'Button',
])

function isDisplayField(field) {
  return !SKIP_FIELDTYPES.has(field.fieldtype) && !field.hidden
}

export function useListFields(metaResource) {
  return computed(() => {
    const meta = metaResource.data
    if (!meta) return []
    let fields = meta.fields.filter((f) => f.in_list_view && isDisplayField(f))
    if (!fields.length) {
      fields = meta.fields.filter(isDisplayField).slice(0, 4)
    }
    return fields
  })
}

export function useFormFields(metaResource) {
  return computed(() => {
    const meta = metaResource.data
    if (!meta) return []
    return meta.fields.filter((f) => isDisplayField(f) && f.fieldtype !== 'Table')
  })
}

export function useTableFields(metaResource) {
  return computed(() => {
    const meta = metaResource.data
    if (!meta) return []
    return meta.fields.filter((f) => f.fieldtype === 'Table' && !f.hidden)
  })
}

const FILTERABLE_FIELDTYPES = new Set(['Select', 'Link', 'Check', 'Date', 'Datetime', 'Data', 'Int'])

export function useFilterFields(metaResource) {
  return computed(() => {
    const meta = metaResource.data
    if (!meta) return []
    let fields = meta.fields.filter((f) => f.in_standard_filter && isDisplayField(f))
    if (!fields.length) {
      fields = meta.fields.filter((f) => f.in_list_view && isDisplayField(f))
    }
    return fields.filter((f) => FILTERABLE_FIELDTYPES.has(f.fieldtype))
  })
}
