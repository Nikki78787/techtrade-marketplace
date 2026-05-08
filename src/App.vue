<template>
  <div class="app-shell">
    <AppLoader :visible="showLoader" :fade-out="fadeOutLoader" />

    <div v-if="!showLoader" class="app-content">
      <AppNavbar />

      <main class="main-content">
        <RouterView :key="route.fullPath" />
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import AppLoader from './components/AppLoader.vue'

const route = useRoute()

const showLoader = ref(true)
const fadeOutLoader = ref(false)

onMounted(() => {
  setTimeout(() => {
    fadeOutLoader.value = true
  }, 1600)

  setTimeout(() => {
    showLoader.value = false
  }, 2600)
})
</script>