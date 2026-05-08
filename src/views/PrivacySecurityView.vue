<template>
  <section class="page container security-page">
    <div class="page-header">
      <h1>Privacy &amp; Security</h1>
      <p>Manage your password and account safety settings.</p>
    </div>

    <div class="security-grid">
      <div class="security-card">
        <h2>Change Password</h2>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" placeholder="Enter new password" />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>
        <button class="btn">Update Password</button>
      </div>

      <div class="security-card">
        <h2>Security Options</h2>
        <div class="security-option">
          <h3>Two-Factor Authentication</h3>
          <p>Extra protection for your account login.</p>
        </div>
        <div class="security-option">
          <h3>Login Activity</h3>
          <p>See recent devices and account access history.</p>
        </div>
        <div class="security-option">
          <h3>Blocked Users</h3>
          <p>Manage people you do not want to interact with.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.security-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p,
.security-option p {
  color: rgba(255, 255, 255, 0.72);
}

.security-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;
}

.security-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.security-card h2,
.security-option h3 {
  color: white;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: white;
}

.form-group input {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.security-option {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

@media (max-width: 900px) {
  .security-grid {
    grid-template-columns: 1fr;
  }
}
</style>