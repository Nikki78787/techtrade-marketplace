import { supabase } from './supabase'
import { logActivity } from './history'

export async function getSavedItemIds() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_items')
    .select('listing_id')
    .eq('user_id', user.id)

  if (error) throw error

  return (data || []).map((item) => item.listing_id)
}

export async function saveListingItem(listingId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be logged in to save listings.')

  const { data, error } = await supabase
    .from('saved_items')
    .insert({
      user_id: user.id,
      listing_id: listingId,
    })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    actionType: 'listing_saved',
    title: 'Listing saved',
    details: `You saved listing #${listingId}.`,
  })

  return data
}

export async function unsaveListingItem(listingId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be logged in to remove saved listings.')

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)

  if (error) throw error

  await logActivity({
    actionType: 'listing_unsaved',
    title: 'Saved listing removed',
    details: `You removed listing #${listingId} from saved items.`,
  })
}
export async function toggleSavedItem(listingId, isCurrentlySaved) {
  if (isCurrentlySaved) {
    await unsaveListingItem(listingId)
    return false
  }

  await saveListingItem(listingId)
  return true
}

export async function getSavedListings() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_items')
    .select(`
      id,
      created_at,
      listings (
        id,
        title,
        description,
        category,
        price,
        condition,
        location,
        status,
        image_urls
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || [])
    .map((item) => item.listings)
    .filter(Boolean)
}