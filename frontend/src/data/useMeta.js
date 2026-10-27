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

// Groups the form's fields by Tab Break > Section Break > Column Break, the
// same three-level structure Frappe desk's own form layout engine reads
// `field_order` into - a doctype's fields are declared in exactly the
// left-to-right, top-to-bottom order they're meant to render in (Column
// Break starts a new column within the current section; a new Section
// Break implicitly closes any open columns and starts a single-column
// section again), and `meta.fields` arrives pre-sorted per field_order, so
// a single linear pass tracking "current tab/section/column" reproduces
// that layout exactly. Fields before the first Tab Break/Section Break (or
// a doctype with neither) land in one untitled tab/section, matching
// Frappe desk's implicit first tab/section.
export function useFormTabs(metaResource) {
  return computed(() => {
    const meta = metaResource.data
    if (!meta) return []

    let sectionId = 0
    function newSection() {
      return { id: sectionId++, label: null, dependsOn: null, columns: [[]] }
    }
    function newTab() {
      return { label: null, dependsOn: null, sections: [newSection()], tables: [] }
    }

    const tabs = [newTab()]
    for (const f of meta.fields) {
      if (f.fieldtype === 'Tab Break') {
        if (!f.hidden) tabs.push({ label: f.label || null, dependsOn: f.depends_on || null, sections: [newSection()], tables: [] })
        continue
      }
      const tab = tabs[tabs.length - 1]
      if (f.fieldtype === 'Section Break') {
        if (!f.hidden) {
          tab.sections.push({ id: sectionId++, label: f.label || null, description: f.description || null, dependsOn: f.depends_on || null, columns: [[]] })
        }
        continue
      }
      // A Table field is remembered on its tab too - DoctypeForm renders it
      // inside that tab when the doctype has real tabs, so a child table
      // sits under the tab it was declared in instead of below the whole
      // form.
      if (f.fieldtype === 'Table' && isDisplayField(f)) {
        tab.tables.push({ ...f, afterSection: tab.sections[tab.sections.length - 1].id })
        continue
      }
      const section = tab.sections[tab.sections.length - 1]
      if (f.fieldtype === 'Column Break') {
        section.columns.push([])
        continue
      }
      if (isDisplayField(f) && f.fieldtype !== 'Table') {
        section.columns[section.columns.length - 1].push(f)
      }
    }

    // Flatten back to a plain field list per tab too (unchanged shape for
    // callers that only need "every field on this tab") alongside the new
    // sections/columns structure the template actually renders from.
    const result = tabs
      .map((tab) => ({
        label: tab.label,
        dependsOn: tab.dependsOn,
        sections: tab.sections
          .map((s) => ({ ...s, columns: s.columns.filter((c) => c.length) }))
          .filter((s) => s.columns.length),
        fields: tab.sections.flatMap((s) => s.columns.flat()),
        tables: tab.tables,
      }))
      .filter((tab) => tab.fields.length > 0 || tab.tables.length > 0)
    // Without real tabs there's nothing to host a table, so tables stay in
    // the bottom list (useTableFields) exactly as before.
    if (result.length <= 1) result.forEach((tab) => (tab.tables = []))
    return result
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
