import { h } from 'vue'
import { FeatherIcon } from 'frappe-ui'

// Sidebar/SidebarItem render `icon` via <component :is="icon" /> with no
// other props passed through, so a bare icon *name* string can't be used
// directly as `icon` - this returns a bound component instance per name.
export default function navIcon(name) {
  return {
    render() {
      return h(FeatherIcon, { name, class: 'h-4 w-4' })
    },
  }
}
