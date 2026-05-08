<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()

const mobileMenuOpen = ref(false)
const currentUser = ref(null)

async function loadUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  currentUser.value = user
}

loadUser()

supabase.auth.onAuthStateChange((event, session) => {
  currentUser.value = session?.user || null
})

const isLoggedIn = computed(() => !!currentUser.value)

function isActive(path) {
  return route.path === path
}

async function handleLogout() {
  await supabase.auth.signOut()
  currentUser.value = null
  mobileMenuOpen.value = false
  router.push('/login')
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <RouterLink to="/" class="logo" @click="closeMobileMenu">
        <span class="logo-accent">Tech</span>Trade
      </RouterLink>

      <div class="nav-search desktop-search">
        <input type="text" placeholder="Browse gadgets, brands, categories..." />
      </div>

      <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
        ☰
      </button>

      <nav class="nav-links desktop-nav">
        <RouterLink to="/buy" :class="{ active: isActive('/buy') }">Browse</RouterLink>
        <RouterLink to="/sell" :class="{ active: isActive('/sell') }">Sell</RouterLink>
        <RouterLink to="/messages" :class="{ active: isActive('/messages') }">Messages</RouterLink>

        <template v-if="isLoggedIn">
          <RouterLink to="/dashboard" :class="{ active: isActive('/dashboard') }">Dashboard</RouterLink>
          <RouterLink to="/my-listings" :class="{ active: isActive('/my-listings') }">My Listings</RouterLink>
          <button class="nav-logout" @click="handleLogout">Logout</button>
        </template>

        <template v-else>
          <RouterLink to="/login" :class="{ active: isActive('/login') }">Login</RouterLink>
        </template>

        <RouterLink to="/settings" :class="{ active: isActive('/settings') }">Settings</RouterLink>
      </nav>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-menu">
      <div class="container mobile-menu-inner">
        <div class="nav-search mobile-search">
          <input type="text" placeholder="Browse gadgets, brands, categories..." />
        </div>

        <RouterLink to="/buy" @click="closeMobileMenu">Browse</RouterLink>
        <RouterLink to="/sell" @click="closeMobileMenu">Sell</RouterLink>
        <RouterLink to="/messages" @click="closeMobileMenu">Messages</RouterLink>

        <template v-if="isLoggedIn">
          <RouterLink to="/dashboard" @click="closeMobileMenu">Dashboard</RouterLink>
          <RouterLink to="/my-listings" @click="closeMobileMenu">My Listings</RouterLink>
          <button class="mobile-logout" @click="handleLogout">Logout</button>
        </template>

        <template v-else>
          <RouterLink to="/login" @click="closeMobileMenu">Login</RouterLink>
        </template>

        <RouterLink to="/settings" @click="closeMobileMenu">Settings</RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(5, 10, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.navbar-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 72px;
}

.logo {
  text-decoration: none;
  color: white;
  font-size: 2rem;
  font-weight: 800;
  white-space: nowrap;
}

.logo-accent {
  color: #a855f7;
}

.nav-search {
  flex: 1;
}

.nav-search input {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  outline: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links a,
.nav-logout,
.mobile-menu a,
.mobile-logout {
  color: white;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-links a.active {
  color: #22d3ee;
}

.nav-logout,
.mobile-logout {
  padding: 0;
}

.menu-toggle {
  display: none;
  border: none;
  background: transparent;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
}

.mobile-menu {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(5, 10, 26, 0.98);
}

.mobile-menu-inner {
  display: grid;
  gap: 1rem;
  padding: 1rem 0 1.2rem;
}

.mobile-menu a,
.mobile-logout {
  padding: 0.3rem 0;
  text-align: left;
}

.mobile-search {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .navbar-inner {
    min-height: 64px;
  }

  .logo {
    font-size: 1.4rem;
  }

  .desktop-search,
  .desktop-nav {
    display: none;
  }

  .menu-toggle {
    display: block;
    margin-left: auto;
  }
}
</style>