<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadProfilePhoto,
} from '../lib/profile'

const loading = ref(true)
const saving = ref(false)
const uploadingPhoto = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const photoPreview = ref('')

const profile = reactive({
  name: '',
  email: '',
  phone: '',
  bio: '',
  photo_url: '',
})

const initials = computed(() => {
  if (!profile.name) return 'U'

  const parts = profile.name.trim().split(' ').filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[1][0]).toUpperCase()
})

async function loadProfile() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const data = await getCurrentUserProfile()

    if (data) {
      profile.name = data.name || ''
      profile.email = data.email || ''
      profile.phone = data.phone || ''
      profile.bio = data.bio || ''
      profile.photo_url = data.photo_url || ''
      photoPreview.value = data.photo_url || ''
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load profile.'
  } finally {
    loading.value = false
  }
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
      photo_url: photoUrl,
    })

    successMessage.value = 'Profile photo updated successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to upload profile photo.'
  } finally {
    uploadingPhoto.value = false
  }
}

async function saveProfile() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateCurrentUserProfile({
      name: profile.name,
      phone: profile.phone,
      bio: profile.bio,
      photo_url: profile.photo_url,
      email: profile.email,
    })

    successMessage.value = 'Profile updated successfully.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to save profile.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <section class="page container account-settings-page">
    <div class="page-header">
      <h1>Account Settings</h1>
      <p>Update your personal account information.</p>
    </div>

    <div v-if="successMessage" class="auth-success">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="auth-error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="account-card state-card">
      <h2>Loading account...</h2>
    </div>

    <div v-else class="account-layout">
      <div class="account-card">
        <h2>Profile Photo</h2>

        <div class="profile-photo-box">
          <div v-if="photoPreview" class="profile-photo-image-wrap">
            <img :src="photoPreview" alt="Profile photo" class="profile-photo-image" />
          </div>

          <div v-else class="profile-avatar">
            {{ initials }}
          </div>

          <label class="btn small-btn upload-btn">
            {{ uploadingPhoto ? 'Uploading...' : 'Upload Photo' }}
            <input
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handlePhotoChange"
            />
          </label>
        </div>
      </div>

      <div class="account-card">
        <h2>Personal Info</h2>

        <form class="account-form" @submit.prevent="saveProfile">
          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="profile.name"
              type="text"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              v-model="profile.email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group full-width">
            <label>Phone Number</label>
            <input
              v-model="profile.phone"
              type="text"
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group full-width">
            <label>Bio</label>
            <textarea
              v-model="profile.bio"
              rows="5"
              placeholder="Write a short bio about yourself"
            ></textarea>
          </div>

          <div class="form-actions full-width">
            <button type="submit" class="btn" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.account-settings-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.72);
}

.account-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.account-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 20px rgba(135, 10, 167, 0.14),
    0 0 40px rgba(135, 10, 167, 0.05);
}

.account-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: white;
}

.state-card {
  text-align: center;
}

.profile-photo-box {
  display: grid;
  gap: 1rem;
  justify-items: center;
}

.profile-avatar,
.profile-photo-image-wrap {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(135, 10, 167, 0.4), rgba(34, 211, 238, 0.2));
  color: white;
  font-size: 2rem;
  font-weight: 800;
  overflow: hidden;
}

.profile-photo-image-wrap {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden-file-input {
  display: none;
}

.upload-btn {
  cursor: pointer;
}

.account-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  outline: none;
  font-size: 0.95rem;
}

.form-group textarea {
  resize: vertical;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  margin-top: 0.4rem;
}

.small-btn {
  padding: 0.7rem 1rem;
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

@media (max-width: 900px) {
  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-form {
    grid-template-columns: 1fr;
  }
}
</style>