import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import type { ChatMessage } from '../api/watchChat'
import { fetchMessages, sendMessage } from '../api/watchChat'

const MAX_MESSAGES = 100

export function useWatchChat(animeId: string, episodeId: string | null) {
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [sending, setSending]     = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Chargement initial
  useEffect(() => {
    if (!animeId) return
    setLoading(true)
    fetchMessages(animeId)
      .then((msgs) => { setMessages(msgs); setError(null) })
      .catch(() => setError('Chat indisponible pour le moment.'))
      .finally(() => setLoading(false))
  }, [animeId])

  // Realtime subscription
  useEffect(() => {
    if (!animeId) return

    const channel = supabase
      .channel(`watch-chat-${animeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'watch_chat_messages',
          filter: `anime_id=eq.${animeId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage
          if (!msg.message) return
          setMessages((prev) => {
            const updated = [...prev, msg]
            return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated
          })
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') setError('Chat indisponible pour le moment.')
      })

    channelRef.current = channel
    return () => { void supabase.removeChannel(channel) }
  }, [animeId])

  async function send(text: string): Promise<void> {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendMessage({ animeId, episodeId, message: text })
    } catch {
      // message envoyé quand même via realtime
    } finally {
      setSending(false)
    }
  }

  return { messages, loading, error, sending, send }
}
