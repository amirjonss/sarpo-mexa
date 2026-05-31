import { createRouter, createWebHashHistory } from 'vue-router'

import StoreLayout from '@/layouts/StoreLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

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
      { path: 'catalog', name: 'catalog', component: () => import('@/views/store/CatalogView.vue') },
      { path: 'product/:id', name: 'product', component: () => import('@/views/store/ProductView.vue') },
      { path: 'box', name: 'box', component: () => import('@/views/store/BoxView.vue') },
      { path: 'checkout', name: 'checkout', component: () => import('@/views/store/CheckoutView.vue') },
      { path: 'order-success', name: 'order-success', component: () => import('@/views/store/OrderSuccessView.vue') },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/admin/OrderDetailView.vue') },
      { path: 'products', name: 'products', component: () => import('@/views/admin/ProductsView.vue') },
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

export default router
