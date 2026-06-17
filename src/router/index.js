import { createRouter, createWebHashHistory } from 'vue-router'

import StoreLayout from '@/layouts/StoreLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { trackPageView } from '@/composables/useAnalytics'

const routes = [
  {
    path: '/',
    component: StoreLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/store/HomeView.vue') },
      { path: 'orders', name: 'store-orders', component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'orders/:id', name: 'store-order-detail', component: () => import('@/views/admin/OrderDetailView.vue') },
      { path: 'clients', name: 'store-clients', component: () => import('@/views/admin/ClientsView.vue') },
      { path: 'clients/:id', name: 'store-client-detail', component: () => import('@/views/admin/ClientDetailView.vue') },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/admin/OrderDetailView.vue') },
      { path: 'calendar', name: 'calendar', component: () => import('@/views/admin/CalendarView.vue') },
      { path: 'products', name: 'products', component: () => import('@/views/admin/ProductsView.vue') },
      { path: 'sets', name: 'sets', component: () => import('@/views/admin/SetsView.vue') },
      { path: 'categories', name: 'categories', component: () => import('@/views/admin/CategoriesView.vue') },
      { path: 'clients', name: 'clients', component: () => import('@/views/admin/ClientsView.vue') },
      { path: 'clients/:id', name: 'admin-client-detail', component: () => import('@/views/admin/ClientDetailView.vue') },
      { path: 'inventory', name: 'inventory', component: () => import('@/views/admin/InventoryView.vue') },
      { path: 'users', name: 'users', component: () => import('@/views/admin/UsersView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Log every visit/navigation to Telegram. afterEach also fires on the initial
// load, so this covers both the first entry and each subsequent page change.
router.afterEach((to) => {
  trackPageView(to)
})

export default router
