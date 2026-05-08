<template>
  <div v-if="visible" class="loader-screen" :class="{ 'loader-screen--fade': fadeOut }">
    <div class="loader-box" :class="{ 'loader-box--fade': fadeOut }">
      <img
        src="../assets/images/logo.png"
        alt="TechTrade Logo"
        class="loader-logo"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  fadeOut: Boolean
})
</script>