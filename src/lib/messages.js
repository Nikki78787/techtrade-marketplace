import { supabase } from './supabase'
import { logActivity } from './history'

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('User not logged in')

  return user.id
}

export async function getOrCreateConversation({ listingId, sellerId }) {
  const userId = await getCurrentUserId()

  if (userId === sellerId) {
    throw new Error('You cannot start a conversation with yourself.')
  }

  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', userId)
    .eq('seller_id', sellerId)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: userId,
      seller_id: sellerId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyConversations() {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listings (
        id,
        title,
        price,
        image_urls
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function sendMessage(conversationId, content) {
  const userId = await getCurrentUserId()

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Message cannot be empty.')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: trimmed,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    actionType: 'message_sent',
    title: 'Message sent',
    details: 'You sent a message in a conversation.',
  })

  return data
}