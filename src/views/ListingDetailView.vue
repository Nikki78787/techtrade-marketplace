<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getListingById } from '../lib/listings'
import { getOrCreateConversation } from '../lib/messages'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const startingChat = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const listing = ref(null)
const selectedImage = ref('')

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

async function loadListing() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const data = await getListingById(route.params.id)
    const imageUrls = Array.isArray(data.image_urls) ? data.image_urls : []

    listing.value = {
      ...data,
      image_urls: imageUrls,
      imageLabel: getImageLabel(data.category),
    }

    selectedImage.value = imageUrls.length ? imageUrls[0] : ''
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load listing.'
  } finally {
    loading.value = false
  }
}

const formattedPrice = computed(() => {
  if (!listing.value) return '$0.00'
  return `$${Number(listing.value.price).toFixed(2)}`
})

function selectImage(image) {
  selectedImage.value = image
}

async function handleMessageSeller() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!listing.value) return

  startingChat.value = true

  try {
    const conversation = await getOrCreateConversation({
      listingId: listing.value.id,
      sellerId: listing.value.user_id,
    })

    router.push(`/messages?conversation=${conversation.id}`)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to start conversation.'
  } finally {
    startingChat.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    loadListing()
  }
)

onMounted(() => {
  loadListing()
})
</script>

<template>
  <section class="page container">
    <div class="detail-page">
      <div v-if="successMessage" class="auth-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="detail-box detail-state-box">
        <h2>Loading listing...</h2>
      </div>

      <div v-else-if="!listing" class="detail-box detail-state-box">
        <h2>Listing not found</h2>
        <button class="btn small-btn" @click="router.push('/buy')">Back to Browse</button>
      </div>

      <template v-else>
        <div class="detail-main-card">
          <div class="detail-image-area">
            <div class="detail-image-placeholder">
              <img
                v-if="selectedImage"
                :src="selectedImage"
                :alt="listing.title"
                class="detail-real-image"
              />
              <span v-else>{{ listing.imageLabel }}</span>
            </div>

            <div
              v-if="listing.image_urls && listing.image_urls.length"
              class="detail-thumbnails"
            >
              <button
                v-for="(image, index) in listing.image_urls"
                :key="`${image}-${index}`"
                type="button"
                class="thumbnail-btn"
                :class="{ active: selectedImage === image }"
                @click="selectImage(image)"
              >
                <img :src="image" :alt="`Listing image ${index + 1}`" class="thumbnail-image" />
              </button>
            </div>
          </div>

          <div class="detail-info-area">
            <div class="detail-label">{{ listing.category }}</div>
            <h1>{{ listing.title }}</h1>
            <div class="detail-price">{{ formattedPrice }}</div>

            <div class="detail-tags">
              <span class="detail-tag">{{ listing.condition }}</span>
              <span class="detail-tag">{{ listing.status }}</span>
              <span class="detail-tag">{{ listing.location || 'Location not provided' }}</span>
            </div>

            <div class="detail-meta">
              <p><strong>Category:</strong> {{ listing.category }}</p>
              <p><strong>Condition:</strong> {{ listing.condition }}</p>
              <p><strong>Location:</strong> {{ listing.location || 'N/A' }}</p>
              <p><strong>Status:</strong> {{ listing.status }}</p>
              <p><strong>Total Photos:</strong> {{ listing.image_urls.length }}</p>
            </div>

            <p class="detail-description">
              {{ listing.description || 'No description provided for this listing yet.' }}
            </p>

            <div class="detail-actions">
              <button class="btn" :disabled="startingChat" @click="handleMessageSeller">
                {{ startingChat ? 'Opening chat...' : 'Message Seller' }}
              </button>

              <button class="btn btn-outline-light" @click="router.push('/buy')">
                Back to Browse
              </button>
            </div>
          </div>
        </div>

        <div class="detail-extra-grid">
          <div class="detail-box">
            <h2>Listing Notes</h2>
            <p><strong>Listing ID:</strong> #{{ listing.id }}</p>
            <p><strong>Price:</strong> {{ formattedPrice }}</p>
            <p><strong>Category:</strong> {{ listing.category }}</p>
            <p><strong>Images:</strong> {{ listing.image_urls.length }}</p>
          </div>
        </div>
      </template>
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

.detail-state-box {
  text-align: center;
  padding: 2rem;
}

.detail-page {
  display: grid;
  gap: 2rem;
}

.detail-main-card {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 20px rgba(135, 10, 167, 0.16),
    0 0 42px rgba(135, 10, 167, 0.05);
}

.detail-image-area {
  display: grid;
  gap: 1rem;
}

.detail-image-placeholder {
  width: 100%;
  min-height: 420px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(135, 10, 167, 0.16), rgba(34, 211, 238, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.3rem;
  font-weight: 700;
  overflow: hidden;
}

.detail-real-image {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
}

.detail-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  gap: 0.8rem;
}

.thumbnail-btn {
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  background: transparent;
  cursor: pointer;
  transition: 0.2s ease;
}

.thumbnail-btn.active {
  border-color: #22d3ee;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
}

.thumbnail-image {
  width: 100%;
  height: 82px;
  object-fit: cover;
  display: block;
}

.detail-info-area h1 {
  margin-top: 0.3rem;
  margin-bottom: 0.7rem;
  color: white;
  font-size: 2.2rem;
}

.detail-label {
  color: #22d3ee;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.detail-price {
  font-size: 2rem;
  font-weight: 800;
  color: #22d3ee;
  margin-bottom: 1rem;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.detail-tag {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(135, 10, 167, 0.16);
  border: 1px solid rgba(135, 10, 167, 0.32);
  color: #f3e8ff;
  font-size: 0.9rem;
}

.detail-meta p,
.detail-description {
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.6;
}

.detail-description {
  margin-top: 1.2rem;
  margin-bottom: 1.4rem;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-extra-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.detail-box {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 20px rgba(135, 10, 167, 0.14),
    0 0 38px rgba(135, 10, 167, 0.05);
}

.detail-box h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: white;
}

.detail-box p {
  color: rgba(255, 255, 255, 0.74);
  margin: 0.5rem 0;
}

@media (max-width: 900px) {
  .detail-main-card {
    grid-template-columns: 1fr;
  }

  .detail-image-placeholder,
  .detail-real-image {
    min-height: 300px;
    height: 300px;
  }
}
</style>