<script setup>
</script>

<template>
  <section class="page container app-info-page">
    <div class="page-header">
      <h1>App Info</h1>
      <p>General information about the project is shown here.</p>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h2>Project Name</h2>
        <p>TechTrade</p>
      </div>

      <div class="info-card">
        <h2>Application Type</h2>
        <p>Marketplace web application</p>
      </div>

      <div class="info-card">
        <h2>Frontend</h2>
        <p>Vue 3</p>
      </div>

      <div class="info-card">
        <h2>Backend / Data</h2>
        <p>Supabase</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-info-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p,
.info-card p {
  color: rgba(255, 255, 255, 0.72);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.info-card h2 {
  margin-top: 0;
  color: white;
}

@media (max-width: 800px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>