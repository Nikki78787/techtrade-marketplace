import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxbepiimqdecegbbwjgq.supabase.co'
const supabaseAnonKey = 'sb_publishable_B6OfnRddbn8Z_-v7KPVmCQ_zubdnHlJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
