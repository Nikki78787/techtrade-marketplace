<script setup>
import { onMounted, ref } from 'vue'
import { getSavedListings, toggleSavedItem } from '../lib/savedItems'

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const savedItems = ref([])

function getImageLabel(category) {
  const map = {
    Phones: 'Phone',
    Laptops: 'Laptop',
    Headphones: 'Headphones',
    Smartwatches: 'Watch',
    Components: 'GPU',
    Tablets: 'Tablet',
    'Home Appliances': 'Appliance',
  }

  return map[category] || 'Gadget'
}

async function loadSavedItems() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const data = await getSavedListings()

    savedItems.value = (data || []).map((listing) => ({
      ...listing,
      image_urls: Array.isArray(listing.image_urls) ? listing.image_urls : [],
      imageLabel: getImageLabel(listing.category),
    }))
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load saved items.'
  } finally {
    loading.value = false
  }
}

async function removeSavedItem(listingId) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await toggleSavedItem(listingId, true)
    successMessage.value = 'Listing removed from saved items.'
    await loadSavedItems()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to remove saved item.'
  }
}

onMounted(() => {
  loadSavedItems()
})
</script>

<template>
  <section class="page container saved-page">
    <div class="page-header">
      <h1>Saved Items</h1>
      <p>Items you save for later will appear here.</p>
    </div>

    <div v-if="successMessage" class="auth-success">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="auth-error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="empty-state-card">
      <h2>Loading saved items...</h2>
    </div>

    <div v-else-if="savedItems.length" class="saved-grid">
      <div v-for="item in savedItems" :key="item.id" class="saved-card">
        <div class="saved-image">
          <img
            v-if="item.image_urls && item.image_urls.length"
            :src="item.image_urls[0]"
            :alt="item.title"
            class="saved-real-image"
          />
          <span v-else>{{ item.imageLabel }}</span>
        </div>

        <div class="saved-content">
          <h3>{{ item.title }}</h3>
          <p class="price">${{ Number(item.price).toFixed(2) }}</p>
          <p class="meta">Category: {{ item.category }}</p>
          <p class="meta">Condition: {{ item.condition }}</p>
          <p class="meta">Location: {{ item.location || 'N/A' }}</p>

          <div class="saved-actions">
            <router-link :to="`/listing/${item.id}`" class="btn small-btn">
              View
            </router-link>

            <button
              type="button"
              class="btn btn-outline-light small-btn"
              @click="removeSavedItem(item.id)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state-card">
      <div class="empty-icon">⭐</div>
      <h2>No saved items yet</h2>
      <p>
        When you save listings from the Browse page, they will appear here for
        quick access later.
      </p>
    </div>
  </section>
</template>

<style scoped>
.saved-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.72);
}

.saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.2rem;
}

.saved-card,
.empty-state-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.empty-state-card {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state-card h2,
.saved-card h3 {
  color: white;
}

.empty-state-card p,
.meta {
  color: rgba(255, 255, 255, 0.72);
}

.saved-image {
  width: 100%;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 700;
}

.saved-real-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.price {
  color: #22d3ee;
  font-weight: 800;
}

.saved-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.auth-success {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #d1fae5;
  font-weight: 600;
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