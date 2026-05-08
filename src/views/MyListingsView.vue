<script setup>
import { computed, onMounted, ref } from 'vue'
import { deleteListing, getMyListings, updateListingStatus } from '../lib/listings'

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const myListings = ref([])

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

async function loadMyListings() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const data = await getMyListings()

    myListings.value = (data || []).map((listing) => ({
      ...listing,
      imageLabel: getImageLabel(listing.category),
      image_urls: Array.isArray(listing.image_urls) ? listing.image_urls : [],
    }))
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load your listings.'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  try {
    await deleteListing(id)
    successMessage.value = 'Listing deleted.'
    await loadMyListings()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to delete listing.'
  }
}

async function handleToggleSold(listing) {
  try {
    const nextStatus = listing.status === 'sold' ? 'active' : 'sold'
    await updateListingStatus(listing.id, nextStatus)
    successMessage.value =
      nextStatus === 'sold' ? 'Listing marked as sold.' : 'Listing relisted.'
    await loadMyListings()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to update listing.'
  }
}

const totalListings = computed(() => myListings.value.length)
const activeListings = computed(() =>
  myListings.value.filter((item) => item.status === 'active').length
)
const soldListings = computed(() =>
  myListings.value.filter((item) => item.status === 'sold').length
)

onMounted(() => {
  loadMyListings()
})
</script>

<template>
  <section class="page container">
    <div class="my-listings-page">
      <div class="my-listings-header">
        <h1>My Listings</h1>
        <p>
          Manage your active gadget listings, monitor availability, and update item
          status.
        </p>
      </div>

      <div v-if="successMessage" class="auth-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <div class="listing-summary-grid">
        <div class="summary-card">
          <h3>Total Listings</h3>
          <p>{{ totalListings }}</p>
        </div>

        <div class="summary-card">
          <h3>Active</h3>
          <p>{{ activeListings }}</p>
        </div>

        <div class="summary-card">
          <h3>Sold</h3>
          <p>{{ soldListings }}</p>
        </div>

        <div class="summary-card">
          <h3>Drafts</h3>
          <p>0</p>
        </div>
      </div>

      <div
        v-if="loading"
        class="my-listing-card"
        style="padding: 1.5rem; text-align: center;"
      >
        <h3>Loading your listings...</h3>
      </div>

      <div v-else-if="myListings.length" class="my-listings-grid">
        <div
          v-for="listing in myListings"
          :key="listing.id"
          class="my-listing-card"
        >
          <div class="my-listing-image">
            <img
              v-if="listing.image_urls && listing.image_urls.length"
              :src="listing.image_urls[0]"
              :alt="listing.title"
              class="my-listing-real-image"
            />
            <span v-else>{{ listing.imageLabel }}</span>
          </div>

          <div class="my-listing-content">
            <h3>{{ listing.title }}</h3>
            <p class="listing-price">${{ Number(listing.price).toFixed(2) }}</p>
            <p class="listing-meta">Category: {{ listing.category }}</p>
            <p class="listing-meta">Location: {{ listing.location || 'N/A' }}</p>
            <p class="listing-meta">Photos: {{ listing.image_urls.length }}</p>

            <p
              class="listing-status"
              :class="listing.status === 'sold' ? 'sold-status' : 'active-status'"
            >
              Status: {{ listing.status }}
            </p>

            <div class="listing-actions">
              <router-link :to="`/listing/${listing.id}`" class="btn small-btn">
                View
              </router-link>

              <router-link :to="`/edit-listing/${listing.id}`" class="btn small-btn">
                Edit
              </router-link>

              <button
                type="button"
                class="btn btn-swap small-btn"
                @click="handleToggleSold(listing)"
              >
                {{ listing.status === 'sold' ? 'Relist' : 'Mark as Sold' }}
              </button>

              <button
                type="button"
                class="btn btn-outline-light small-btn"
                @click="handleDelete(listing.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="my-listing-card"
        style="padding: 1.5rem; text-align: center;"
      >
        <h3>No listings yet</h3>
        <p class="listing-meta">Create your first listing from the Sell page.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.my-listing-real-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-swap {
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
  color: #fff;
}
</style>