<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../lib/auth'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')
const message = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''
  message.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Please enter your email and password.'
    loading.value = false
    return
  }

  try {
    await loginUser(form.email, form.password)
    message.value = 'Login successful.'

    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  } catch (error) {
    errorMessage.value = error.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page container auth-page">
    <div class="auth-layout">
      <div class="auth-info-panel">
        <h1>Welcome Back to TechTrade</h1>
        <p>
          Log in to continue buying, selling, and managing your gadget listings.
        </p>

        <div class="auth-features">
          <div class="auth-feature-card">
            <h3>Manage Listings</h3>
            <p>View and manage the gadgets you posted for sale.</p>
          </div>

          <div class="auth-feature-card">
            <h3>Stay Connected</h3>
            <p>Check your messages, offers, and activity all in one place.</p>
          </div>
        </div>
      </div>

      <div class="auth-form-card">
        <h2>Login</h2>
        <p class="auth-subtext">Sign in to your marketplace account</p>

        <div v-if="message" class="auth-success">
          {{ message }}
        </div>

        <div v-if="errorMessage" class="auth-error">
          {{ errorMessage }}
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="auth-form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="auth-form-group">
            <label>Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" class="btn auth-btn" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <p class="auth-switch-text">
            Don’t have an account?
            <router-link to="/register">Register here</router-link>
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
</style>    