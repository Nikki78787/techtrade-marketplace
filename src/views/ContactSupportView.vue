<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  email: '',
  type: 'Review',
  message: '',
  rating: '',
})

const successMessage = ref('')
const errorMessage = ref('')

function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!form.email || !form.message) {
    errorMessage.value = 'Please complete the required fields.'
    return
  }

  successMessage.value = 'Your message has been recorded in the form.'
}
</script>

<template>
  <section class="page container support-page">
    <div class="page-header">
      <h1>Contact Support</h1>
      <p>Send a review or report a problem using the form below.</p>
    </div>

    <div v-if="successMessage" class="auth-success">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="auth-error">
      {{ errorMessage }}
    </div>

    <div class="support-card">
      <form class="support-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="form.type">
            <option>Review</option>
            <option>Bug Report</option>
            <option>Account Issue</option>
            <option>Listing Problem</option>
            <option>Payment Issue</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label>Message</label>
          <textarea
            v-model="form.message"
            rows="6"
            placeholder="Tell us what happened or share your feedback"
          ></textarea>
        </div>

        <div class="form-group full-width">
          <label>Star Rating</label>
          <select v-model="form.rating">
            <option value="">Select rating</option>
            <option>1 Star</option>
            <option>2 Stars</option>
            <option>3 Stars</option>
            <option>4 Stars</option>
            <option>5 Stars</option>
          </select>
        </div>

        <div class="full-width">
          <button type="submit" class="btn">Submit</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.support-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.72);
}

.support-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.support-form {
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
.form-group select,
.form-group textarea {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.full-width {
  grid-column: 1 / -1;
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

@media (max-width: 800px) {
  .support-form {
    grid-template-columns: 1fr;
  }
}
</style>