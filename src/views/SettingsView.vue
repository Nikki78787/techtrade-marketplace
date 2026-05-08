<template>
  <section class="page container settings-page">
    <div class="settings-header">
      <h1>Settings</h1>
      <p>Manage your account, activity, support, and app preferences.</p>
    </div>

    <div v-if="message" class="settings-message">
      {{ message }}
    </div>

    <div class="settings-grid">
      <router-link to="/settings/account" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">1</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Account</h2>
        <p>Change name, photo, email, and password.</p>
      </router-link>

      <router-link to="/history" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">2</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Transaction History</h2>
        <p>See all your buy and sell activity.</p>
      </router-link>

      <router-link to="/my-listings" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">3</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>My Listings</h2>
        <p>Manage active, sold, and draft listings.</p>
      </router-link>

      <router-link to="/settings/saved" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">4</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Saved Items</h2>
        <p>View your liked and saved gadgets.</p>
      </router-link>

      <router-link to="/settings/notifications" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">5</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Notifications</h2>
        <p>Control alerts for messages, listings, and updates.</p>
      </router-link>

      <router-link to="/settings/security" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">6</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Privacy &amp; Security</h2>
        <p>Manage password, privacy, and account safety.</p>
      </router-link>

      <router-link to="/settings/support" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">7</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Contact Support</h2>
        <p>Send a review or report a problem.</p>
      </router-link>

      <router-link to="/settings/help" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">8</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Help Center</h2>
        <p>Find answers to common questions.</p>
      </router-link>

      <router-link to="/settings/app-info" class="settings-card">
        <div class="settings-card-top">
          <span class="settings-number">9</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>App Info</h2>
        <p>See version, terms, privacy policy, and app details.</p>
      </router-link>

      <button type="button" class="settings-card logout-card" @click="handleLogout">
        <div class="settings-card-top">
          <span class="settings-number">10</span>
          <span class="settings-arrow">›</span>
        </div>
        <h2>Log Out</h2>
        <p>Sign out from your account safely.</p>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = ref('')

function handleLogout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  localStorage.removeItem('auth')
  localStorage.removeItem('app-settings')

  message.value = 'Logged out successfully.'

  setTimeout(() => {
    router.push('/login')
  }, 800)
}
</script>

<style scoped>
.settings-page {
  padding-top: 2rem;
  padding-bottom: 3rem;
  color: #fff;
}

.settings-header {
  margin-bottom: 1.5rem;
}

.settings-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2.1rem;
}

.settings-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  max-width: 700px;
  line-height: 1.6;
}

.settings-message {
  margin-bottom: 1.2rem;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.28);
  color: #d1fae5;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.settings-card {
  display: block;
  text-align: left;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 1.3rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 18px rgba(135, 10, 167, 0.14),
    0 0 38px rgba(135, 10, 167, 0.05);
  transition: 0.25s ease;
  color: #ffffff;
  cursor: pointer;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 0 24px rgba(135, 10, 167, 0.22),
    0 0 48px rgba(135, 10, 167, 0.09);
}

.settings-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.settings-number {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(135, 10, 167, 0.2);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
}

.settings-arrow {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.5);
}

.settings-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  color: #ffffff;
}

.settings-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.logout-card {
  border: 1px solid rgba(239, 68, 68, 0.22);
  background: rgba(239, 68, 68, 0.06);
}

.logout-card .settings-number {
  background: rgba(239, 68, 68, 0.18);
}

.logout-card:hover {
  box-shadow:
    0 0 20px rgba(239, 68, 68, 0.16),
    0 0 38px rgba(239, 68, 68, 0.08);
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>