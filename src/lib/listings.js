import { supabase } from './supabase'
import { logActivity } from './history'

export async function uploadListingImages(files) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in')
  }

  const uploadedUrls = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `listings/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath)

    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}

export async function createListing(listing) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in')
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: Number(listing.price),
      condition: listing.condition,
      location: listing.location,
      status: listing.status || 'active',
      image_urls: listing.image_urls || [],
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  await logActivity({
    actionType: 'listing_created',
    title: 'Listing created',
    details: `${listing.title} was added to your listings.`,
  })

  return data
}


export async function getAllListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getMyListings() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getListingById(id) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from('listings')
    .update({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      price: Number(updates.price),
      condition: updates.condition,
      location: updates.location,
      image_urls: updates.image_urls || [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logActivity({
    actionType: 'listing_updated',
    title: 'Listing updated',
    details: `${updates.title} was updated.`,
  })

  return data
}

export async function deleteListing(id) {
  const existing = await getListingById(id)

  const { error } = await supabase.from('listings').delete().eq('id', id)

  if (error) {
    throw error
  }

  await logActivity({
    actionType: 'listing_deleted',
    title: 'Listing deleted',
    details: `${existing?.title || 'A listing'} was removed.`,
  })
}

export async function updateListingStatus(id, status) {
  const { data, error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logActivity({
    actionType: 'listing_status_updated',
    title: status === 'sold' ? 'Listing marked as sold' : 'Listing relisted',
    details: `${data?.title || 'Listing'} is now ${status}.`,
  })

  return data
}