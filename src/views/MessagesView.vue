<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCurrentUserId, getMessages, getMyConversations, sendMessage } from '../lib/messages'

const route = useRoute()

const loading = ref(true)
const loadingMessages = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentUserId = ref('')
const conversations = ref([])
const selectedConversation = ref(null)
const messages = ref([])

const form = reactive({
  content: '',
})

function getConversationTitle(conversation) {
  const listing = conversation.listings
  return listing?.title || `Conversation #${conversation.id}`
}

function getConversationImage(conversation) {
  const listing = conversation.listings
  return Array.isArray(listing?.image_urls) && listing.image_urls.length
    ? listing.image_urls[0]
    : ''
}

async function loadConversations() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    currentUserId.value = await getCurrentUserId()
    conversations.value = await getMyConversations()

    const wantedId = route.query.conversation
      ? Number(route.query.conversation)
      : null

    if (wantedId) {
      const found = conversations.value.find((item) => item.id === wantedId)
      if (found) {
        await selectConversation(found)
      } else if (conversations.value.length) {
        await selectConversation(conversations.value[0])
      }
    } else if (conversations.value.length) {
      await selectConversation(conversations.value[0])
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load conversations.'
  } finally {
    loading.value = false
  }
}

async function selectConversation(conversation) {
  selectedConversation.value = conversation
  loadingMessages.value = true
  errorMessage.value = ''

  try {
    messages.value = await getMessages(conversation.id)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to load messages.'
  } finally {
    loadingMessages.value = false
  }
}

async function handleSendMessage() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (!selectedConversation.value) {
      throw new Error('Select a conversation first.')
    }

    await sendMessage(selectedConversation.value.id, form.content)
    form.content = ''
    messages.value = await getMessages(selectedConversation.value.id)
    successMessage.value = 'Message sent.'
  } catch (error) {
    errorMessage.value = error.message || 'Failed to send message.'
  }
}

const selectedTitle = computed(() => {
  if (!selectedConversation.value) return 'Messages'
  return getConversationTitle(selectedConversation.value)
})

onMounted(() => {
  loadConversations()
})
</script>

<template>
  <section class="page container messages-page">
    <div class="page-header">
      <h1>Messages</h1>
      <p>Buyer and seller conversations appear here.</p>
    </div>

    <div v-if="successMessage" class="auth-success">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="auth-error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="messages-shell">
      <div class="messages-panel empty-panel">
        <h2>Loading conversations...</h2>
      </div>
    </div>

    <div v-else-if="!conversations.length" class="messages-shell">
      <div class="messages-panel empty-panel">
        <div class="empty-icon">💬</div>
        <h2>No conversations yet</h2>
        <p>When buyers or sellers start chatting, your conversations will appear here.</p>
      </div>
    </div>

    <div v-else class="messages-shell">
      <aside class="messages-sidebar">
        <h2>Conversations</h2>

        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          type="button"
          class="conversation-item"
          :class="{ active: selectedConversation?.id === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-thumb">
            <img
              v-if="getConversationImage(conversation)"
              :src="getConversationImage(conversation)"
              :alt="getConversationTitle(conversation)"
              class="conversation-thumb-image"
            />
            <span v-else>Item</span>
          </div>

          <div class="conversation-info">
            <h3>{{ getConversationTitle(conversation) }}</h3>
            <p>
              {{ conversation.listings?.price ? `$${Number(conversation.listings.price).toFixed(2)}` : 'Listing chat' }}
            </p>
          </div>
        </button>
      </aside>

      <div class="messages-panel">
        <div class="messages-topbar">
          <h2>{{ selectedTitle }}</h2>
        </div>

        <div v-if="loadingMessages" class="messages-feed empty-panel">
          <p>Loading messages...</p>
        </div>

        <div v-else class="messages-feed">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-bubble"
            :class="{ mine: message.sender_id === currentUserId }"
          >
            <p>{{ message.content }}</p>
          </div>

          <div v-if="!messages.length" class="empty-chat">
            No messages in this conversation yet.
          </div>
        </div>

        <form class="message-form" @submit.prevent="handleSendMessage">
          <input
            v-model="form.content"
            type="text"
            placeholder="Type your message..."
          />
          <button type="submit" class="btn">Send</button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.messages-page {
  display: grid;
  gap: 1.5rem;
}

.page-header p {
  color: rgba(255, 255, 255, 0.72);
}

.messages-shell {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
}

.messages-sidebar,
.messages-panel {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 22px;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.messages-sidebar h2,
.messages-topbar h2 {
  margin-top: 0;
  color: white;
}

.conversation-item {
  width: 100%;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0.8rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  cursor: pointer;
  color: white;
}

.conversation-item.active {
  border-color: rgba(34, 211, 238, 0.45);
}

.conversation-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
}

.conversation-thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conversation-info h3 {
  margin: 0 0 0.3rem;
  font-size: 1rem;
}

.conversation-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
}

.messages-feed {
  min-height: 360px;
  max-height: 460px;
  overflow-y: auto;
  display: grid;
  gap: 0.8rem;
  margin: 1rem 0;
  padding-right: 0.2rem;
}

.message-bubble {
  max-width: 75%;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.message-bubble.mine {
  margin-left: auto;
  background: rgba(34, 211, 238, 0.18);
  border: 1px solid rgba(34, 211, 238, 0.25);
}

.message-bubble p {
  margin: 0;
  line-height: 1.5;
}

.message-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.8rem;
}

.message-form input {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.empty-panel,
.empty-chat {
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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
  .messages-shell {
    grid-template-columns: 1fr;
  }
}
</style>