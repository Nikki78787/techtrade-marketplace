<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllListings } from '../lib/listings'
import { getSavedItemIds, toggleSavedItem } from '../lib/savedItems'

const route = useRoute()
const router = useRouter()

const categories = [
  'Phones',
  'Laptops',
  'Headphones',
  'Smartwatches',
  'Components',
  'Tablets',
  'Home Appliances',
]

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const listings = ref([])
const savedIds = ref([])

const filters = reactive({
  search: '',
  category: typeof route.query.category === 'string' ? route.query.category : '',
  condition: '',
  location: '',
})

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

async function loadListings() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [data, saved] = await Promise.all([
      getAllListings(),
      getSavedItemIds().catch(() => []),
    ])

    savedIds.value = saved

    listings.value = (Array.isArray(data) ? data : [])
      .filter((listing) => listing && listing.id)
      .map((listing) => ({
        ...listing,
        image_urls: Array.isArray(listing.image_urls) ? listing.image_urls : [],
        imageLabel: getImageLabel(listing.category),
      }))
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load listings.'
    listings.value = []
  } finally {
    loading.value = false
  }
}

function isSaved(listingId) {
  return savedIds.value.includes(listingId)
}

async function handleToggleSave(listingId) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const nowSaved = await toggleSavedItem(listingId, isSaved(listingId))

    if (nowSaved) {
      savedIds.value = [...savedIds.value, listingId]
      successMessage.value = 'Listing saved.'
    } else {
      savedIds.value = savedIds.value.filter((id) => id !== listingId)
      successMessage.value = 'Listing removed from saved items.'
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to update saved items.'
  }
}

watch(
  () => route.query.category,
  (newCategory) => {
    filters.category = typeof newCategory === 'string' ? newCategory : ''
  }
)

const filteredListings = computed(() => {
  return listings.value.filter((listing) => {
    if (!listing) return false

    const matchesSearch =
      !filters.search ||
      (listing.title || '').toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory =
      !filters.category || listing.category === filters.category

    const matchesCondition =
      !filters.condition || listing.condition === filters.condition

    const matchesLocation =
      !filters.location ||
      (listing.location || '').toLowerCase().includes(filters.location.toLowerCase())

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      matchesLocation
    )
  })
})

function clearCategoryFilter() {
  filters.search = ''
  filters.category = ''
  filters.condition = ''
  filters.location = ''
  router.replace({ path: '/buy', query: {} })
}

onMounted(() => {
  loadListings()
})
</script>

<template>
  <section class="page container">
    <div class="buy-header">
      <h1>Browse Gadgets</h1>
      <p>Discover gadgets from private sellers and shops.</p>
    </div>

    <div v-if="successMessage" class="auth-success">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage && !loading" class="auth-error">
      {{ errorMessage }}
    </div>

    <div class="buy-filters">
      <input v-model="filters.search" type="text" placeholder="Search gadgets..." />

      <select v-model="filters.category">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <select v-model="filters.condition">
        <option value="">All Conditions</option>
        <option>New</option>
        <option>Used</option>
        <option>Refurbished</option>
      </select>

      <input v-model="filters.location" type="text" placeholder="Location" />

      <button type="button" class="btn small-btn" @click="clearCategoryFilter">
        Clear Filters
      </button>
    </div>

    <p v-if="filters.category" class="meta" style="margin-bottom: 1rem;">
      Showing category: <strong>{{ filters.category }}</strong>
    </p>

    <div v-if="loading" class="listing-card" style="padding: 1.5rem; text-align: center;">
      <h3>Loading listings...</h3>
    </div>

    <div v-else-if="filteredListings.length" class="listing-grid">
      <div v-for="listing in filteredListings" :key="listing.id" class="listing-card">
        <div class="listing-image placeholder-image">
          <img
            v-if="listing && listing.image_urls && listing.image_urls.length"
            :src="listing.image_urls[0]"
            :alt="listing.title"
            class="listing-real-image"
          />
          <span v-else>{{ listing?.imageLabel || 'Gadget' }}</span>
        </div>

        <div class="listing-content">
          <h3>{{ listing.title || 'Untitled Listing' }}</h3>
          <p class="price">${{ Number(listing.price || 0).toFixed(2) }}</p>
          <p class="meta">Category: {{ listing.category || 'N/A' }}</p>
          <p class="meta">Condition: {{ listing.condition || 'N/A' }}</p>
          <p class="meta">Location: {{ listing.location || 'N/A' }}</p>
          <p class="meta">Status: {{ listing.status || 'active' }}</p>

          <div class="listing-actions">
            <router-link :to="`/listing/${listing.id}`" class="btn small-btn">
              View Details
            </router-link>

            <button
              type="button"
              class="btn btn-outline-light small-btn"
              @click="handleToggleSave(listing.id)"
            >
              {{ isSaved(listing.id) ? 'Saved' : 'Save Listing' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="listing-card" style="padding: 1.5rem; text-align: center;">
      <h3>No listings found</h3>
      <p class="meta">Try changing the search or filters.</p>
    </div>
  </section>
</template>

<style scoped>
.listing-real-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.listing-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
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