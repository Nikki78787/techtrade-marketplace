import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

import HomeView from '../views/HomeView.vue'
import BuyView from '../views/BuyView.vue'
import ListingDetailView from '../views/ListingDetailView.vue'
import SellView from '../views/SellView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import MyListingsView from '../views/MyListingsView.vue'
import HistoryView from '../views/HistoryView.vue'
import MessagesView from '../views/MessagesView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import SettingsView from '../views/SettingsView.vue'

import AccountSettingsView from '../views/AccountSettingsView.vue'
import SavedItemsView from '../views/SavedItemsView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import PrivacySecurityView from '../views/PrivacySecurityView.vue'
import ContactSupportView from '../views/ContactSupportView.vue'
import HelpCenterView from '../views/HelpCenterView.vue'
import AppInfoView from '../views/AppInfoView.vue'
import EditListingView from '../views/EditListingView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/buy', name: 'buy', component: BuyView },
  { path: '/listing/:id', name: 'listing-detail', component: ListingDetailView },

  {
    path: '/sell',
    name: 'sell',
    component: SellView,
    meta: { requiresAuth: true },
  },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-listings',
    name: 'my-listings',
    component: MyListingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessagesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true },
  },

  {
    path: '/settings/account',
    name: 'settings-account',
    component: AccountSettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/saved',
    name: 'settings-saved',
    component: SavedItemsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/notifications',
    name: 'settings-notifications',
    component: NotificationsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/security',
    name: 'settings-security',
    component: PrivacySecurityView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/support',
    name: 'settings-support',
    component: ContactSupportView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/help',
    name: 'settings-help',
    component: HelpCenterView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings/app-info',
    name: 'settings-app-info',
    component: AppInfoView,
    meta: { requiresAuth: true },
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },

  {
  path: '/edit-listing/:id',
  name: 'edit-listing',
  component: EditListingView,
  meta: { requiresAuth: true },
},


]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoggedIn = !!session?.user
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    next('/dashboard')
    return
  }



  next()
})

export default router