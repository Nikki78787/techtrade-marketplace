<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMyActivityLogs } from '../lib/history'

const loading = ref(true)
const errorMessage = ref('')
const historyItems = ref([])

function getIcon(actionType) {
  const map = {
    profile_updated: '👤',
    profile_photo_updated: '🖼️',
    listing_created: '📦',
    listing_updated: '✏️',
    listing_deleted: '🗑️',
    listing_status_updated: '✅',
    listing_saved: '⭐',
    listing_unsaved: '❌',
    message_sent: '💬',
  }

  return map[actionType] || '📝'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const totalActivities = computed(() => historyItems.value.length)

async function loadHistory() {
  loading.value = true
  errorMessage.value = ''

  try {
    historyItems.value = await getMyActivityLogs()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load history.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <section class="page container history-page">
    <div class="page-header">
      <h1>Activity History</h1>
      <p>Your recent actions across the marketplace appear here.</p>
    </div>

    <div v-if="errorMessage" class="auth-error">
      {{ errorMessage }}
    </div>

    <div class="summary-card">
      <h2>Total Activity</h2>
      <p>{{ totalActivities }}</p>
    </div>

    <div v-if="loading" class="empty-state-card">
      <h2>Loading history...</h2>
    </div>

    <div v-else-if="historyItems.length" class="history-list">
      <div v-for="item in historyItems" :key="item.id" class="history-card">
        <div class="history-icon">
          {{ getIcon(item.action_type) }}
        </div>

        <div class="history-content">
          <h3>{{ item.title }}</h3>
          <p v-if="item.details">{{ item.details }}</p>
          <small>{{ formatDate(item.created_at) }}</small>
        </div>
      </div>
    </div>

    <div v-else class="empty-state-card">
      <div class="empty-icon">🧾</div>
      <h2>No history yet</h2>
      <p>
        Once you start using the marketplace, your actions will appear here.
      </p>
    </div>
  </section>
</template>

<style scoped>
.history-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.72);
}

.summary-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  max-width: 240px;
}

.summary-card h2 {
  margin-top: 0;
  color: white;
}

.summary-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #22d3ee;
}

.history-list {
  display: grid;
  gap: 1rem;
}

.history-card {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.history-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.05);
}

.history-content h3 {
  margin: 0 0 0.35rem;
  color: white;
}

.history-content p {
  margin: 0 0 0.4rem;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.6;
}

.history-content small {
  color: rgba(255, 255, 255, 0.52);
}

.empty-state-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state-card h2 {
  color: white;
  margin-bottom: 0.6rem;
}

.empty-state-card p {
  color: rgba(255, 255, 255, 0.72);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

.auth-error {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fee2e2;
  font-weight: 600;
}
</style>