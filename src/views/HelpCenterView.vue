<script setup>
</script>

<template>
  <section class="page container help-page">
    <div class="page-header">
      <h1>Help Center</h1>
      <p>Helpful information and support guidance can be placed here.</p>
    </div>

    <div class="info-card">
      <h2>Help and guidance</h2>
      <p>
        This section can be expanded later with FAQs, account help, listing
        guidance, and buyer or seller support resources.
      </p>
    </div>
  </section>
</template>

<style scoped>
.help-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p,
.info-card p {
  color: rgba(255, 255, 255, 0.72);
}

.info-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.info-card h2 {
  margin-top: 0;
  color: white;
}
</style>