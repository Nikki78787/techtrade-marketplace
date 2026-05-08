import { supabase } from './supabase'

export async function getMyShop() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createOrUpdateShop(shop) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('User not logged in')

  const existing = await getMyShop()

  const payload = {
    user_id: user.id,
    shop_name: shop.shop_name,
    shop_location: shop.shop_location,
    shop_photo_urls: shop.shop_photo_urls || [],
    shop_description: shop.shop_description,
    seller_type: shop.seller_type,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('shops')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('shops')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadShopPhotos(files) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('User not logged in')

  const uploadedUrls = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `shops/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('shop-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('shop-photos')
      .getPublicUrl(filePath)

    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}