<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  getCurrentUserProfile,
  updateAuthEmail,
  updateCurrentUserProfile,
  uploadProfilePhoto,
} from '../lib/profile'
import {
  createOrUpdateShop,
  getMyShop,
  uploadShopPhotos,
} from '../lib/shop'
import { getMyListings } from '../lib/listings'

const loading = ref(true)
const saving = ref(false)
const uploadingPhoto = ref(false)
const savingShop = ref(false)
const uploadingShopPhotos = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const photoPreview = ref('')

const profile = reactive({
  name: '',
  email: '',
  bio: '',
  photo_url: '',
  phone: '',
})

const verification = reactive({
  emailVerified: false,
  phoneVerified: false,
  emailOtp: '',
  phoneOtp: '',
  emailOtpInput: '',
  phoneOtpInput: '',
  emailOtpSent: false,
  phoneOtpSent: false,
})

const shop = reactive({
  shopName: '',
  sellerType: 'Private Seller',
  shopLocation: '',
  shopDescription: '',
  shopPhotos: [],
})

const stats = reactive({
  totalListings: 0,
  activeListings: 0,
  soldListings: 0,
})

const initials = computed(() => {
  if (!profile.name) return 'U'
  const parts = profile.name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})

function isValidName(value) {
  return !!value && value.trim().length >= 2
}

function isValidEmail(value) {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidPhone(value) {
  if (!value) return false
  const cleaned = value.replace(/\s+/g, '').trim()
  return /^(\+60|60|0)1\d{8,9}$/.test(cleaned)
}

function isValidBio(value) {
  if (!value) return false
  const words = value.trim().split(/\s+/).filter(Boolean)
  return words.length >= 3
}

function isValidPhoto(value) {
  return !!value && value.trim().length > 0
}

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

const profileChecks = computed(() => [
  { label: 'Name', valid: isValidName(profile.name), hint: 'Add at least 2 characters' },
  { label: 'Email', valid: isValidEmail(profile.email), hint: 'Use a valid email address' },
  { label: 'Phone', valid: isValidPhone(profile.phone), hint: 'Use Malaysian format like +60 104 299 384' },
  { label: 'Bio', valid: isValidBio(profile.bio), hint: 'Write at least 3 words' },
  { label: 'Photo', valid: isValidPhoto(profile.photo_url), hint: 'Upload a profile photo' },
])

const completedFields = computed(() => {
  return profileChecks.value.filter((field) => field.valid).length
})

const profileCompletion = computed(() => {
  const total = profileChecks.value.length
  if (!total) return 0
  return Math.round((completedFields.value / total) * 100)
})

const circleStyle = computed(() => {
  return {
    background: `conic-gradient(#22d3ee 0% ${profileCompletion.value}%, rgba(255,255,255,0.08) ${profileCompletion.value}% 100%)`,
  }
})

const missingFields = computed(() => {
  return profileChecks.value.filter((field) => !field.valid)
})

const shopOwnerRequirementsMet = computed(() => {
  return (
    isValidEmail(profile.email) &&
    isValidPhone(profile.phone) &&
    verification.emailVerified &&
    verification.phoneVerified
  )
})

const showShopUnlockWarning = computed(() => {
  return shop.sellerType === 'Shop Owner' && !shopOwnerRequirementsMet.value
})

async function loadProfile() {
  const data = await getCurrentUserProfile()

  if (data) {
    profile.name = data.name || ''
    profile.email = data.email || ''
    profile.bio = data.bio || ''
    profile.photo_url = data.photo_url || ''
    profile.phone = data.phone || ''
    photoPreview.value = data.photo_url || ''

    verification.emailVerified = !!data.email_verified
    verification.phoneVerified = !!data.phone_verified
  }
}

async function loadShop() {
  const data = await getMyShop()

  if (data) {
    shop.shopName = data.shop_name || ''
    shop.shopLocation = data.shop_location || ''
    shop.shopDescription = data.shop_description || ''
    shop.shopPhotos = Array.isArray(data.shop_photo_urls) ? data.shop_photo_urls : []
    shop.sellerType = data.seller_type || 'Private Seller'
  }
}

async function loadStats() {
  const listings = await getMyListings()
  stats.totalListings = listings.length
  stats.activeListings = listings.filter((item) => item.status === 'active').length
  stats.soldListings = listings.filter((item) => item.status === 'sold').length
}

async function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadingPhoto.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const photoUrl = await uploadProfilePhoto(file)
    profile.photo_url = photoUrl
    photoPreview.value = photoUrl

    await updateCurrentUserProfile({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      photo_url: photoUrl,
      phone: profile.phone,
      email_verified: verification.emailVerified,
      phone_verified: verification.phoneVerified,
    })

    successMessage.value = 'Profile photo updated successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to upload profile photo.'
  } finally {
    uploadingPhoto.value = false
  }
}

async function handleShopPhotoChange(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  errorMessage.value = ''
  successMessage.value = ''

  if (files.length + shop.shopPhotos.length > 10) {
    errorMessage.value = 'You can upload a maximum of 10 shop photos.'
    return
  }

  uploadingShopPhotos.value = true

  try {
    const uploadedUrls = await uploadShopPhotos(files)
    shop.shopPhotos = [...shop.shopPhotos, ...uploadedUrls]
    successMessage.value = `${uploadedUrls.length} shop photo(s) uploaded successfully.`
  } catch (error) {
    errorMessage.value = error.message || 'Failed to upload shop photos.'
  } finally {
    uploadingShopPhotos.value = false
  }
}

function removeShopPhoto(index) {
  shop.shopPhotos.splice(index, 1)
}

async function saveProfile() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const current = await getCurrentUserProfile()
    const oldEmail = current?.email || ''
    const oldPhone = current?.phone || ''

    if (profile.email && profile.email !== oldEmail) {
      if (!isValidEmail(profile.email)) {
        throw new Error('Please enter a valid email address.')
      }

      await updateAuthEmail(profile.email)
      verification.emailVerified = false
      verification.emailOtpSent = false
      verification.emailOtp = ''
      verification.emailOtpInput = ''
    }

    if (profile.phone !== oldPhone) {
      verification.phoneVerified = false
      verification.phoneOtpSent = false
      verification.phoneOtp = ''
      verification.phoneOtpInput = ''
    }

    await updateCurrentUserProfile({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      photo_url: profile.photo_url,
      phone: profile.phone,
      email_verified: verification.emailVerified,
      phone_verified: verification.phoneVerified,
    })

    successMessage.value = 'Profile updated successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save profile.'
  } finally {
    saving.value = false
  }
}

async function saveShop() {
  savingShop.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (shop.sellerType === 'Shop Owner' && !shopOwnerRequirementsMet.value) {
      throw new Error('Verify email and phone first before saving shop information.')
    }

    if (shop.sellerType === 'Shop Owner') {
      if (!shop.shopName.trim()) throw new Error('Please enter shop name.')
      if (!shop.shopLocation.trim()) throw new Error('Please enter shop location.')
      if (!shop.shopDescription.trim()) throw new Error('Please enter shop description.')
      if (!shop.shopPhotos.length) throw new Error('Please upload at least 1 shop photo.')
    }

    await createOrUpdateShop({
      shop_name: shop.sellerType === 'Shop Owner' ? shop.shopName : '',
      shop_location: shop.sellerType === 'Shop Owner' ? shop.shopLocation : '',
      shop_photo_urls: shop.sellerType === 'Shop Owner' ? shop.shopPhotos : [],
      shop_description: shop.sellerType === 'Shop Owner' ? shop.shopDescription : '',
      seller_type: shop.sellerType,
    })

    successMessage.value = 'Shop information saved successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save shop information.'
  } finally {
    savingShop.value = false
  }
}

function sendEmailOtp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isValidEmail(profile.email)) {
    errorMessage.value = 'Enter a valid email before requesting OTP.'
    return
  }

  verification.emailOtp = generateOtp()
  verification.emailOtpSent = true
  verification.emailVerified = false
  verification.emailOtpInput = ''
  successMessage.value = 'Email OTP sent successfully.'
}

async function verifyEmailOtp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!verification.emailOtpSent) {
    errorMessage.value = 'Send email OTP first.'
    return
  }

  if (verification.emailOtpInput.trim() !== verification.emailOtp) {
    errorMessage.value = 'Incorrect email OTP.'
    return
  }

  try {
    verification.emailVerified = true

    await updateCurrentUserProfile({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      photo_url: profile.photo_url,
      phone: profile.phone,
      email_verified: true,
      phone_verified: verification.phoneVerified,
    })

    successMessage.value = 'Email verified successfully.'
  } catch (error) {
    verification.emailVerified = false
    errorMessage.value = error.message || 'Failed to save email verification.'
  }
}

function sendPhoneOtp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isValidPhone(profile.phone)) {
    errorMessage.value = 'Enter a valid Malaysian phone number before requesting OTP.'
    return
  }

  verification.phoneOtp = generateOtp()
  verification.phoneOtpSent = true
  verification.phoneVerified = false
  verification.phoneOtpInput = ''
  successMessage.value = 'Phone OTP sent successfully.'
}

async function verifyPhoneOtp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!verification.phoneOtpSent) {
    errorMessage.value = 'Send phone OTP first.'
    return
  }

  if (verification.phoneOtpInput.trim() !== verification.phoneOtp) {
    errorMessage.value = 'Incorrect phone OTP.'
    return
  }

  try {
    verification.phoneVerified = true

    await updateCurrentUserProfile({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      photo_url: profile.photo_url,
      phone: profile.phone,
      email_verified: verification.emailVerified,
      phone_verified: true,
    })

    successMessage.value = 'Phone number verified successfully.'
  } catch (error) {
    verification.phoneVerified = false
    errorMessage.value = error.message || 'Failed to save phone verification.'
  }
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await loadProfile()
    await loadShop()
    await loadStats()
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load dashboard.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page container">
    <div class="dashboard-page">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Manage your profile, marketplace settings, and account information.</p>
      </div>

      <div v-if="successMessage" class="auth-success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <div class="dashboard-layout">
        <div class="dashboard-main">
          <div class="dashboard-card">
            <h2>Profile Setup</h2>

            <div v-if="loading" class="loading-box">
              Loading profile...
            </div>

            <template v-else>
              <div class="profile-top">
                <div v-if="photoPreview" class="profile-avatar profile-avatar-image-wrap">
                  <img :src="photoPreview" alt="Profile photo" class="profile-avatar-image" />
                </div>

                <div v-else class="profile-avatar">
                  {{ initials }}
                </div>

                <div class="profile-info">
                  <h3>{{ profile.name || 'No name yet' }}</h3>
                  <p>{{ profile.email || 'No email yet' }}</p>

                  <div class="profile-actions">
                    <label class="btn small-btn upload-btn">
                      {{ uploadingPhoto ? 'Uploading...' : 'Change Photo' }}
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden-file-input"
                        @change="handlePhotoChange"
                      />
                    </label>

                    <button type="button" class="btn small-btn" :disabled="saving" @click="saveProfile">
                      {{ saving ? 'Saving...' : 'Save Profile' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="dashboard-form-grid">
                <div class="dashboard-form-group">
                  <label>Display Name</label>
                  <input v-model="profile.name" type="text" placeholder="Enter your display name" />
                  <small class="field-hint">At least 2 characters</small>
                </div>

                <div class="dashboard-form-group">
                  <label>Edit Email</label>
                  <input v-model="profile.email" type="email" placeholder="Edit email" />
                  <small class="field-hint">Example: name@email.com</small>
                </div>

                <div class="dashboard-form-group full-width verify-block">
                  <div class="verify-header">
                    <label>Email Verification</label>
                    <span class="verify-status" :class="{ verified: verification.emailVerified }">
                      {{ verification.emailVerified ? 'Verified' : 'Not Verified' }}
                    </span>
                  </div>

                  <div class="verify-row">
                    <button type="button" class="btn small-btn" @click="sendEmailOtp">
                      Send 4-digit OTP
                    </button>

                    <input
                      v-model="verification.emailOtpInput"
                      type="text"
                      maxlength="4"
                      placeholder="Enter 4-digit OTP"
                    />

                    <button type="button" class="btn small-btn" @click="verifyEmailOtp">
                      Verify
                    </button>
                  </div>
                </div>

                <div class="dashboard-form-group full-width">
                  <label>Phone Number</label>
                  <input
                    v-model="profile.phone"
                    type="text"
                    placeholder="Example: +60 104 299 384"
                  />
                  <small class="field-hint">Malaysian number format only</small>
                </div>

                <div class="dashboard-form-group full-width verify-block">
                  <div class="verify-header">
                    <label>Phone Verification</label>
                    <span class="verify-status" :class="{ verified: verification.phoneVerified }">
                      {{ verification.phoneVerified ? 'Verified' : 'Not Verified' }}
                    </span>
                  </div>

                  <div class="verify-row">
                    <button type="button" class="btn small-btn" @click="sendPhoneOtp">
                      Send 4-digit OTP
                    </button>

                    <input
                      v-model="verification.phoneOtpInput"
                      type="text"
                      maxlength="4"
                      placeholder="Enter 4-digit OTP"
                    />

                    <button type="button" class="btn small-btn" @click="verifyPhoneOtp">
                      Verify
                    </button>
                  </div>
                </div>

                <div class="dashboard-form-group full-width">
                  <label>Bio</label>
                  <textarea
                    v-model="profile.bio"
                    rows="5"
                    placeholder="Write at least 3 words about yourself or your shop..."
                  ></textarea>
                  <small class="field-hint">Minimum 3 words</small>
                </div>
              </div>
            </template>
          </div>

          <div class="dashboard-card">
            <h2>Shop Setup</h2>

            <div class="dashboard-form-grid">
              <div class="dashboard-form-group">
                <label>Seller Type</label>
                <select v-model="shop.sellerType">
                  <option>Private Seller</option>
                  <option>Shop Owner</option>
                </select>
              </div>

              <div class="dashboard-form-group full-width" v-if="showShopUnlockWarning">
                <div class="shop-warning-box">
                  <strong>Shop owner requirements not met.</strong>
                  <p>To use Shop Owner setup, you must first complete:</p>
                  <ul>
                    <li>Valid email + verified email OTP</li>
                    <li>Valid Malaysian phone + verified phone OTP</li>
                  </ul>
                </div>
              </div>

              <template v-if="shop.sellerType === 'Private Seller'">
                <div class="dashboard-form-group full-width">
                  <button
                    type="button"
                    class="btn"
                    :disabled="savingShop"
                    @click="saveShop"
                  >
                    {{ savingShop ? 'Saving...' : 'Save Seller Type' }}
                  </button>
                </div>
              </template>

              <template v-else>
                <div class="dashboard-form-group">
                  <label>Shop Name</label>
                  <input
                    v-model="shop.shopName"
                    type="text"
                    placeholder="Enter your shop name"
                    :disabled="!shopOwnerRequirementsMet"
                  />
                </div>

                <div class="dashboard-form-group">
                  <label>Shop Location</label>
                  <input
                    v-model="shop.shopLocation"
                    type="text"
                    placeholder="Enter your shop location"
                    :disabled="!shopOwnerRequirementsMet"
                  />
                </div>

                <div class="dashboard-form-group full-width">
                  <label>Shop Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    :disabled="!shopOwnerRequirementsMet || shop.shopPhotos.length >= 10 || uploadingShopPhotos"
                    @change="handleShopPhotoChange"
                  />
                  <small class="field-hint">
                    Upload up to 10 shop images ({{ shop.shopPhotos.length }}/10)
                  </small>
                  <small v-if="uploadingShopPhotos" class="field-hint">
                    Uploading photos...
                  </small>
                </div>

                <div v-if="shop.shopPhotos.length && shopOwnerRequirementsMet" class="dashboard-form-group full-width">
                  <div class="shop-photo-grid">
                    <div
                      v-for="(photo, index) in shop.shopPhotos"
                      :key="photo"
                      class="shop-photo-item"
                    >
                      <img :src="photo" :alt="`Shop photo ${index + 1}`" class="shop-preview-image" />
                      <button type="button" class="remove-photo-btn" @click="removeShopPhoto(index)">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="dashboard-form-group full-width">
                  <label>Shop Description</label>
                  <textarea
                    v-model="shop.shopDescription"
                    rows="4"
                    placeholder="Describe your shop and what you sell..."
                    :disabled="!shopOwnerRequirementsMet"
                  ></textarea>
                </div>

                <div class="dashboard-form-group full-width">
                  <button
                    type="button"
                    class="btn"
                    :disabled="savingShop || !shopOwnerRequirementsMet"
                    @click="saveShop"
                  >
                    {{ savingShop ? 'Saving...' : 'Save Shop' }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="dashboard-sidebar">
          <div class="dashboard-card completion-card">
            <h2>Profile Completion</h2>

            <div class="completion-wrap">
              <div class="progress-ring" :style="circleStyle">
                <div class="progress-ring-inner">
                  <span>{{ profileCompletion }}%</span>
                </div>
              </div>

              <div class="completion-info">
                <p class="completion-text">
                  {{ completedFields }} of {{ profileChecks.length }} profile fields completed
                </p>

                <div v-if="missingFields.length" class="missing-fields">
                  <p class="missing-title">Still missing:</p>
                  <ul>
                    <li v-for="field in missingFields" :key="field.label">
                      {{ field.label }} — {{ field.hint }}
                    </li>
                  </ul>
                </div>

                <p v-else class="completion-done">
                  Your profile is fully completed.
                </p>
              </div>
            </div>
          </div>

          <div class="dashboard-card stats-card">
            <h2>Account Summary</h2>
            <p><strong>Name:</strong> {{ isValidName(profile.name) ? profile.name : 'Not valid yet' }}</p>
            <p><strong>Email:</strong> {{ verification.emailVerified ? 'Verified' : 'Not verified' }}</p>
            <p><strong>Phone:</strong> {{ verification.phoneVerified ? 'Verified' : 'Not verified' }}</p>
            <p><strong>Bio:</strong> {{ isValidBio(profile.bio) ? 'Added' : 'Needs at least 3 words' }}</p>
            <p><strong>Photo:</strong> {{ isValidPhoto(profile.photo_url) ? 'Uploaded' : 'Not uploaded yet' }}</p>
            <p><strong>Seller Type:</strong> {{ shop.sellerType }}</p>
            <p><strong>Total Listings:</strong> {{ stats.totalListings }}</p>
            <p><strong>Active Listings:</strong> {{ stats.activeListings }}</p>
            <p><strong>Sold Listings:</strong> {{ stats.soldListings }}</p>
            <p v-if="shop.sellerType === 'Shop Owner'"><strong>Shop Name:</strong> {{ shop.shopName || 'Not set' }}</p>
            <p v-if="shop.sellerType === 'Shop Owner'"><strong>Shop Photos:</strong> {{ shop.shopPhotos.length }}</p>
          </div>

          <div class="dashboard-card">
            <h2>Quick Access</h2>
            <div class="dashboard-links">
              <router-link to="/my-listings" class="dashboard-link-btn">My Listings</router-link>
              <router-link to="/history" class="dashboard-link-btn">History</router-link>
              <router-link to="/settings" class="dashboard-link-btn">Settings</router-link>
              <router-link to="/messages" class="dashboard-link-btn">Messages</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  padding: 2rem 0 3rem;
  color: #ffffff;
}

.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-header h1 {
  margin: 0 0 0.6rem;
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
}

.dashboard-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.dashboard-main,
.dashboard-sidebar {
  display: grid;
  gap: 1.5rem;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 20px rgba(135, 10, 167, 0.14),
    0 0 40px rgba(135, 10, 167, 0.05);
}

.dashboard-card h2 {
  margin: 0 0 1.2rem;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
}

.loading-box {
  color: rgba(255, 255, 255, 0.75);
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.profile-avatar,
.profile-avatar-image-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(135, 10, 167, 0.35), rgba(34, 211, 238, 0.2));
  color: #ffffff;
  font-weight: 800;
  font-size: 1.8rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-avatar-image-wrap {
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h3 {
  margin: 0 0 0.3rem;
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 800;
}

.profile-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
}

.profile-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.dashboard-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.dashboard-form-group {
  display: flex;
  flex-direction: column;
}

.dashboard-form-group label {
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 700;
}

.dashboard-form-group input,
.dashboard-form-group select,
.dashboard-form-group textarea {
  width: 100%;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  outline: none;
  font-size: 0.96rem;
  box-sizing: border-box;
}

.dashboard-form-group input::placeholder,
.dashboard-form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.dashboard-form-group input:focus,
.dashboard-form-group select:focus,
.dashboard-form-group textarea:focus {
  border-color: rgba(34, 211, 238, 0.75);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.08);
}

.dashboard-form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.dashboard-form-group input:disabled,
.dashboard-form-group textarea:disabled,
.dashboard-form-group select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.full-width {
  grid-column: 1 / -1;
}

.hidden-file-input {
  display: none;
}

.upload-btn {
  cursor: pointer;
}

.verify-block {
  padding: 0.8rem 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.verify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.verify-status {
  font-size: 0.86rem;
  font-weight: 700;
  color: #f59e0b;
}

.verify-status.verified {
  color: #22c55e;
}

.verify-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
}

.verify-row input {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  outline: none;
}

.completion-card {
  overflow: hidden;
}

.completion-wrap {
  display: grid;
  gap: 1.2rem;
  justify-items: center;
}

.progress-ring {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.progress-ring-inner {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: rgba(10, 15, 30, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
  font-size: 1.6rem;
  font-weight: 800;
}

.completion-info {
  width: 100%;
}

.completion-text {
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0.9rem;
}

.missing-title {
  margin: 0 0 0.5rem;
  color: #ffffff;
  font-weight: 700;
}

.missing-fields ul {
  margin: 0;
  padding-left: 1.1rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.8;
}

.completion-done {
  color: #22c55e;
  font-weight: 700;
}

.field-hint {
  margin-top: 0.45rem;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.82rem;
}

.shop-warning-box {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  color: #fde68a;
}

.shop-warning-box strong {
  color: #fde68a;
}

.shop-warning-box p {
  margin: 0.4rem 0 0.5rem;
}

.shop-warning-box ul {
  margin: 0;
  padding-left: 1.1rem;
}

.shop-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.shop-photo-item {
  display: grid;
  gap: 0.6rem;
}

.shop-preview-image {
  width: 100%;
  height: 140px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: block;
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

.stats-card p {
  margin: 0.55rem 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.6;
}

.dashboard-links {
  display: grid;
  gap: 0.8rem;
}

.dashboard-link-btn {
  display: block;
  text-decoration: none;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.95rem 1rem;
  border-radius: 14px;
  transition: 0.2s ease;
}

.dashboard-link-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.35);
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.2rem;
  background: linear-gradient(135deg, #8b1bd1, #2cc9f3);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.small-btn {
  padding: 0.78rem 1rem;
  font-size: 0.92rem;
}

.auth-success {
  margin-bottom: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #d1fae5;
  font-weight: 700;
}

.auth-error {
  margin-bottom: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fee2e2;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .dashboard-form-grid {
    grid-template-columns: 1fr;
  }

  .verify-row {
    grid-template-columns: 1fr;
  }

  .profile-top {
    align-items: flex-start;
  }
}
</style>