<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const isLoggedIn = ref(false)

async function checkUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  isLoggedIn.value = !!user
}

async function handleLogout() {
  await supabase.auth.signOut()
  isLoggedIn.value = false
  router.push('/login')
}

onMounted(() => {
  checkUser()

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session?.user
  })
})
</script>

<template>
  <header class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="site-logo">
        <span class="site-logo-tech">Tech</span>
        <span class="site-logo-trade">Trade</span>
      </RouterLink>

      <div class="nav-search">
        <input type="text" placeholder="Browse gadgets, brands, categories..." />
      </div>

      <nav class="nav-links">
        <RouterLink to="/buy">Browse</RouterLink>
        <RouterLink to="/sell">Sell</RouterLink>
        <RouterLink to="/messages">Messages</RouterLink>

        <RouterLink v-if="!isLoggedIn" to="/login">Login</RouterLink>

        <RouterLink v-if="isLoggedIn" to="/dashboard">Dashboard</RouterLink>
        <RouterLink v-if="isLoggedIn" to="/my-listings">My Listings</RouterLink>

        <button v-if="isLoggedIn" class="nav-logout-btn" @click="handleLogout">
          Logout
        </button>

        <RouterLink to="/settings">Settings</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-logout-btn {
  background: none;
  border: none;
  color: #e2e8f0;
  font-size: 0.96rem;
  cursor: pointer;
  transition: 0.2s ease;
  padding: 0;
  font: inherit;
}

.nav-logout-btn:hover {
  color: #22d3ee;
}
</style>