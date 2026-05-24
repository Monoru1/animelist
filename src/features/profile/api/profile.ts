import { supabase } from '@/services/supabaseClient'

export type Profile = {
  id: string
  username: string
  email: string
  role: string
  avatar_url: string | null
}

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,email,role,avatar_url')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Profile
}

export async function updateProfile(id: string, updates: { username: string; avatar_url: string | null }): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id)
  if (error) throw error
}
