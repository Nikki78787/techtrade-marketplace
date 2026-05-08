<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../lib/auth'

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

async function handleRegister() {
  loading.value = true
  message.value = ''
  errorMessage.value = ''

  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    errorMessage.value = 'Please fill in all required fields.'
    loading.value = false
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    loading.value = false
    return
  }

  try {
    await registerUser(form.name, form.email, form.password)
    message.value = 'Account created successfully.'

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page container auth-page">
    <div class="auth-layout">
      <div class="auth-info-panel">
        <h1>Join TechTrade Today</h1>
        <p>
          Create your account to start buying, selling, and managing gadgets in
          one modern marketplace platform.
        </p>

        <div class="auth-features">
          <div class="auth-feature-card">
            <h3>Sell Faster</h3>
            <p>Post your gadgets with a clean and professional listing process.</p>
          </div>

          <div class="auth-feature-card">
            <h3>Track Activity</h3>
            <p>Monitor purchases, sales, messages, and account activity easily.</p>
          </div>
        </div>
      </div>

      <div class="auth-form-card">
        <h2>Register</h2>
        <p class="auth-subtext">Create your marketplace account</p>

        <div v-if="message" class="auth-success">
          {{ message }}
        </div>

        <div v-if="errorMessage" class="auth-error">
          {{ errorMessage }}
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="auth-form-group">
            <label>Username</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Choose a username"
            />
          </div>

          <div class="auth-form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="auth-form-group">
            <label>Phone Number</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="Enter your phone number"
            />
          </div>

          <div class="auth-form-group">
            <label>Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Create a secure password"
            />
          </div>

          <div class="auth-form-group full-width">
            <label>Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" class="btn auth-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Register' }}
          </button>

          <p class="auth-switch-text">
            Already have an account?
            <router-link to="/login">Login here</router-link>
          </p>
        </form>
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

.full-width {
  grid-column: 1 / -1;
}
</style>