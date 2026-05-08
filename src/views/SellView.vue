<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createListing, uploadListingImages } from '../lib/listings'

const router = useRouter()

const form = reactive({
  title: '',
  price: '',
  category: '',
  condition: '',
  location: '',
  description: '',
  availableForSwap: false,
})

const listingImages = ref([])
const loading = ref(false)
const uploadingImages = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function handleFilesChange(event) {
  const files = Array.from(event.target.files || [])

  if (!files.length) return

  if (files.length > 10) {
    errorMessage.value = 'You can upload a maximum of 10 listing photos.'
    return
  }

  listingImages.value = files
  errorMessage.value = ''
}

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  if (
    !form.title ||
    !form.price ||
    !form.category ||
    !form.condition ||
    !form.location ||
    !form.description
  ) {
    errorMessage.value = 'Please fill in all required fields.'
    loading.value = false
    return
  }

  try {
    let imageUrls = []

    if (listingImages.value.length) {
      uploadingImages.value = true
      imageUrls = await uploadListingImages(listingImages.value)
      uploadingImages.value = false
    }

    await createListing({
      title: form.title,
      price: form.price,
      category: form.category,
      condition: form.condition,
      location: form.location,
      description: form.description,
      status: 'active',
      image_urls: imageUrls,
    })

    successMessage.value = 'Listing published successfully.'

    form.title = ''
    form.price = ''
    form.category = ''
    form.condition = ''
    form.location = ''
    form.description = ''
    form.availableForSwap = false
    listingImages.value = []

    setTimeout(() => {
      router.push('/my-listings')
    }, 900)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to publish listing.'
  } finally {
    loading.value = false
    uploadingImages.value = false
  }
}
</script>

<template>
  <section class="page container">
    <div class="sell-page">
      <div class="sell-header">
        <h1>Create a New Listing</h1>
        <p>
          Post your gadget for sale on TechTrade. Fill in the details below to
          create an attractive listing for buyers.
        </p>
      </div>

      <div v-if="successMessage" class="auth-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <div class="sell-layout">
        <div class="sell-form-card">
          <form class="sell-form" @submit.prevent="handleSubmit">
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
              <label>Upload Photos</label>
              <input type="file" accept="image/*" multiple @change="handleFilesChange" />
              <small class="field-hint">
                Upload up to 10 photos ({{ listingImages.length }}/10)
              </small>
              <small v-if="uploadingImages" class="field-hint">
                Uploading photos...
              </small>
            </div>

            <div v-if="listingImages.length" class="form-group full-width">
              <div class="selected-files-box">
                {{ listingImages.length }} photo(s) selected
              </div>
            </div>

            <div class="form-group full-width checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.availableForSwap" type="checkbox" />
                Available for swap
              </label>
            </div>

            <div class="form-group full-width">
              <button type="submit" class="btn" :disabled="loading || uploadingImages">
                {{ loading ? 'Publishing...' : 'Publish Listing' }}
              </button>
            </div>
          </form>
        </div>

        <div class="sell-side-panel">
          <div class="sell-tip-box">
            <h2>Listing Tips</h2>
            <ul>
              <li>Use a clear and specific title</li>
              <li>Add real product photos</li>
              <li>Mention defects honestly</li>
              <li>Include accessories and warranty details</li>
              <li>Set a fair and competitive price</li>
            </ul>
          </div>

          <div class="sell-tip-box">
            <h2>Preview Summary</h2>
            <p><strong>Status:</strong> Draft</p>
            <p><strong>Visibility:</strong> Public</p>
            <p><strong>Marketplace:</strong> TechTrade</p>
            <p><strong>Category:</strong> {{ form.category || 'Not selected' }}</p>
            <p><strong>Price:</strong> {{ form.price || '0' }}</p>
            <p><strong>Photos:</strong> {{ listingImages.length }}</p>
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
</style>