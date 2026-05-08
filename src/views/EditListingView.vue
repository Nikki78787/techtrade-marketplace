<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getListingById,
  updateListing,
  uploadListingImages,
} from '../lib/listings'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const uploadingImages = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  title: '',
  price: '',
  category: '',
  condition: '',
  location: '',
  description: '',
  image_urls: [],
})

const newImages = ref([])

async function loadListing() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getListingById(route.params.id)

    form.title = data.title || ''
    form.price = data.price || ''
    form.category = data.category || ''
    form.condition = data.condition || ''
    form.location = data.location || ''
    form.description = data.description || ''
    form.image_urls = Array.isArray(data.image_urls) ? data.image_urls : []
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load listing.'
  } finally {
    loading.value = false
  }
}

function handleFilesChange(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  if (files.length + form.image_urls.length > 10) {
    errorMessage.value = 'You can upload a maximum of 10 listing photos.'
    return
  }

  newImages.value = files
  errorMessage.value = ''
}

function removeExistingImage(index) {
  form.image_urls.splice(index, 1)
}

async function saveListing() {
  saving.value = true
  uploadingImages.value = false
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (
      !form.title ||
      !form.price ||
      !form.category ||
      !form.condition ||
      !form.location ||
      !form.description
    ) {
      throw new Error('Please fill in all required fields.')
    }

    let uploadedUrls = []

    if (newImages.value.length) {
      uploadingImages.value = true
      uploadedUrls = await uploadListingImages(newImages.value)
      uploadingImages.value = false
    }

    const finalImages = [...form.image_urls, ...uploadedUrls]

    if (finalImages.length > 10) {
      throw new Error('You can only keep up to 10 listing photos.')
    }

    await updateListing(route.params.id, {
      title: form.title,
      price: form.price,
      category: form.category,
      condition: form.condition,
      location: form.location,
      description: form.description,
      image_urls: finalImages,
    })

    form.image_urls = finalImages
    newImages.value = []
    successMessage.value = 'Listing updated successfully.'

    setTimeout(() => {
      router.push('/my-listings')
    }, 900)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to update listing.'
  } finally {
    saving.value = false
    uploadingImages.value = false
  }
}

onMounted(() => {
  loadListing()
})
</script>

<template>
  <section class="page container">
    <div class="sell-page">
      <div class="sell-header">
        <h1>Edit Listing</h1>
        <p>Update your listing details, price, description, and photos.</p>
      </div>

      <div v-if="successMessage" class="auth-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="sell-form-card">
        <h3>Loading listing...</h3>
      </div>

      <div v-else class="sell-layout">
        <div class="sell-form-card">
          <form class="sell-form" @submit.prevent="saveListing">
            <div class="form-group full-width">
              <label>Listing Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. iPhone 13 Pro Max 256GB"
              />
            </div>

            <div class="form-group">
              <label>Price</label>
              <input
                v-model="form.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 850"
              />
            </div>

            <div class="form-group">
              <label>Category</label>
              <select v-model="form.category">
                <option value="">Select Category</option>
                <option>Phones</option>
                <option>Laptops</option>
                <option>Headphones</option>
                <option>Smartwatches</option>
                <option>Components</option>
                <option>Home Appliances</option>
                <option>Tablets</option>
              </select>
            </div>

            <div class="form-group">
              <label>Condition</label>
              <select v-model="form.condition">
                <option value="">Select Condition</option>
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Location</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="e.g. Melbourne"
              />
            </div>

            <div class="form-group full-width">
              <label>Description</label>
              <textarea
                v-model="form.description"
                rows="6"
                placeholder="Describe the product condition, included accessories, warranty, and other useful details..."
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label>Current Photos</label>
              <div v-if="form.image_urls.length" class="edit-photo-grid">
                <div
                  v-for="(image, index) in form.image_urls"
                  :key="`${image}-${index}`"
                  class="edit-photo-item"
                >
                  <img :src="image" :alt="`Listing photo ${index + 1}`" class="edit-photo-image" />
                  <button type="button" class="remove-photo-btn" @click="removeExistingImage(index)">
                    Remove
                  </button>
                </div>
              </div>
              <div v-else class="selected-files-box">
                No photos yet
              </div>
            </div>

            <div class="form-group full-width">
              <label>Add More Photos</label>
              <input type="file" accept="image/*" multiple @change="handleFilesChange" />
              <small class="field-hint">
                Up to 10 total photos (current: {{ form.image_urls.length }})
              </small>
              <small v-if="newImages.length" class="field-hint">
                {{ newImages.length }} new photo(s) selected
              </small>
              <small v-if="uploadingImages" class="field-hint">
                Uploading photos...
              </small>
            </div>

            <div class="form-group full-width">
              <button type="submit" class="btn" :disabled="saving || uploadingImages">
                {{ saving ? 'Saving Changes...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="sell-side-panel">
          <div class="sell-tip-box">
            <h2>Editing Tips</h2>
            <ul>
              <li>Keep the title clear and specific</li>
              <li>Update price if the market changes</li>
              <li>Remove bad photos and add clearer ones</li>
              <li>Keep the description honest and detailed</li>
            </ul>
          </div>

          <div class="sell-tip-box">
            <h2>Current Summary</h2>
            <p><strong>Category:</strong> {{ form.category || 'Not selected' }}</p>
            <p><strong>Price:</strong> {{ form.price || '0' }}</p>
            <p><strong>Condition:</strong> {{ form.condition || 'Not selected' }}</p>
            <p><strong>Photos:</strong> {{ form.image_urls.length }}</p>
          </div>
        </div>
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

.field-hint {
  margin-top: 0.45rem;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.82rem;
}

.selected-files-box {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

.edit-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.edit-photo-item {
  display: grid;
  gap: 0.6rem;
}

.edit-photo-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.remove-photo-btn {
  border: none;
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fee2e2;
  font-weight: 700;
  cursor: pointer;
}

.remove-photo-btn:hover {
  background: rgba(239, 68, 68, 0.22);
}
</style>