import { supabase } from './supabase'

export async function logActivity({ actionType, title, details = '' }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: user.id,
      action_type: actionType,
      title,
      details,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyActivityLogs() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return []

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}