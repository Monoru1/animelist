import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useWatchChat } from '../hooks/useWatchChat'
import type { ChatMessage } from '../api/watchChat'

function timeStr(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, currentUserId }: { msg: ChatMessage; currentUserId: string }) {
  const isOwn = msg.user_id === currentUserId
  return (
    <div className={`chat-msg${isOwn ? ' chat-msg--own' : ''}`}>
      {!isOwn ? <span className="chat-username">{msg.username}</span> : null}
      <div className="chat-bubble">
        <span className="chat-text">{msg.message}</span>
        <span className="chat-time">{timeStr(msg.created_at)}</span>
      </div>
    </div>
  )
}

type Props = {
  animeId: string
  episodeId: string | null
  currentUserId: string
  onClose?: () => void
  className?: string
}

export function WatchChatPanel({ animeId, episodeId, currentUserId, onClose, className = '' }: Props) {
  const { messages, loading, error, sending, send } = useWatchChat(animeId, episodeId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas sur nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    void send(input)
    setInput('')
  }

  return (
    <div className={`chat-panel ${className}`}>
      <div className="chat-header">
        <span className="chat-header-title">
          <span className="chat-live-dot" />
          Chat en direct
        </span>
        {onClose ? (
          <button type="button" className="chat-close-btn" onClick={onClose} aria-label="Fermer le chat">×</button>
        ) : null}
      </div>

      <div className="chat-messages">
        {loading ? (
          <p className="chat-status">Connexion…</p>
        ) : error ? (
          <p className="chat-status chat-status--error">{error}</p>
        ) : messages.length === 0 ? (
          <p className="chat-status">Sois le premier à écrire !</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Envoyer un message…"
          maxLength={300}
          autoComplete="off"
          disabled={!!error}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || sending || !!error}
          aria-label="Envoyer"
        >
          {sending ? '…' : '↑'}
        </button>
      </form>
    </div>
  )
}
