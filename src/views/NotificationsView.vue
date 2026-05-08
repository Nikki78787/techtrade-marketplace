<script setup>
</script>

<template>
  <section class="page container notifications-page">
    <div class="page-header">
      <h1>Notifications</h1>
      <p>Notification preferences will be available here.</p>
    </div>

    <div class="info-card">
      <h2>Notification settings</h2>
      <p>
        Notification controls can be added here later if you decide to support
        alerts for listings, messages, or account activity.
      </p>
    </div>
  </section>
</template>

<style scoped>
.notifications-page {
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