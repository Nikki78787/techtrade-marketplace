import { supabase } from './supabase'

export async function registerUser(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    throw new Error('User was not created')
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    name,
    email,
    photo_url: '',
  })

  if (profileError) {
    throw profileError
  }

  return user
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}