import { supabase } from './supabase'
import { logActivity } from './history'

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return {
    ...data,
    email: data.email || user.email || '',
    email_verified: data.email_verified ?? false,
    phone_verified: data.phone_verified ?? false,
  }
}

export async function updateCurrentUserProfile(updates) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('User not logged in')

  const profileUpdates = {
    name: updates.name ?? '',
    phone: updates.phone ?? '',
    bio: updates.bio ?? '',
    photo_url: updates.photo_url ?? '',
    email: updates.email ?? user.email ?? '',
    email_verified: updates.email_verified ?? false,
    phone_verified: updates.phone_verified ?? false,
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    actionType: 'profile_updated',
    title: 'Profile updated',
    details: 'Your account profile information was updated.',
  })

  return data
}
export async function updateAuthEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) throw error
  return data
}

export async function uploadProfilePhoto(file) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('User not logged in')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)

  await logActivity({
    actionType: 'profile_photo_updated',
    title: 'Profile photo updated',
    details: 'You uploaded a new profile photo.',
  })

  return data.publicUrl
}