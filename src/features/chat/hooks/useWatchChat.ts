import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import type { ChatMessage } from '../api/watchChat'
import { fetchMessages, sendMessage } from '../api/watchChat'

export function useWatchChat(animeId: string, episodeId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [sending, setSending]   = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Chargement initial
  useEffect(() => {
    if (!animeId) return
    setLoading(true)
    setError(null)
    fetchMessages(animeId)
      .then(msgs => { setMessages(msgs); setError(null) })
      .catch(err => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg.includes('does not exist') || msg.includes('42P01')
          ? 'Chat indisponible pour le moment.'
          : 'Impossible de charger le chat.')
      })
      .finally(() => setLoading(false))
  }, [animeId])

  // Realtime
  useEffect(() => {
    if (!animeId) return
    const ch = supabase
      .channel(`watch-chat-${animeId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'watch_chat_messages',
        filter: `anime_id=eq.${animeId}`,
      }, payload => {
        const msg = payload.new as ChatMessage
        if (!msg?.message) return
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          const next = [...prev, msg]
          return next.length > 100 ? next.slice(-100) : next
        })
      })
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          setError('Chat indisponible pour le moment.')
        }
      })
    channelRef.current = ch
    return () => { void supabase.removeChannel(ch) }
  }, [animeId])

  async function send(text: string) {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendMessage({ animeId, episodeId, message: text.trim() })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('permission') || msg.includes('RLS')
        ? 'Tu dois être connecté pour envoyer un message.'
        : 'Erreur envoi : ' + msg)
    } finally {
      setSending(false)
    }
  }

  return { messages, loading, error, sending, send }
}
