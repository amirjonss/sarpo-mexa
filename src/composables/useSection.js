import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Order/client views are mounted under both the store ('') and admin ('/admin')
// layouts. This returns the current section's base path so internal links stay
// within the same layout.
export function useSectionBase() {
  const route = useRoute()
  return computed(() => (route.path.startsWith('/admin') ? '/admin' : ''))
}
