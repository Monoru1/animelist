import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useWatchChat } from '../hooks/useWatchChat'
import type { ChatMessage } from '../api/watchChat'

function timeStr(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function Bubble({ msg, currentUserId }: { msg: ChatMessage; currentUserId: string }) {
  const own = msg.user_id === currentUserId
  return (
    <div className={`chat-msg${own ? ' chat-msg--own' : ''}`}>
      {!own ? <span className="chat-username">{msg.username ?? 'Anonyme'}</span> : null}
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
  isOpen: boolean
  onClose: () => void
}

export function WatchChatPanel({ animeId, episodeId, currentUserId, isOpen, onClose }: Props) {
  const { messages, loading, error, sending, send } = useWatchChat(animeId, episodeId)
  const [input, setInput]   = useState('')
  const bottomRef           = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    void send(input.trim())
    setInput('')
  }

  const panel = (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-header-title">
          <span className="chat-live-dot" />
          Chat en direct
        </span>
        <button type="button" className="chat-close-btn" onClick={onClose} aria-label="Fermer">×</button>
      </div>

      <div className="chat-messages">
        {loading ? <p className="chat-status">Connexion…</p>
          : error ? <p className="chat-status chat-status--error">{error}</p>
          : messages.length === 0 ? <p className="chat-status">Sois le premier à écrire !</p>
          : messages.map(m => <Bubble key={m.id} msg={m} currentUserId={currentUserId} />)
        }
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Envoyer un message…"
          maxLength={300}
          autoComplete="off"
          disabled={!!error}
        />
        <button type="submit" className="chat-send-btn"
          disabled={!input.trim() || sending || !!error} aria-label="Envoyer">
          {sending ? '…' : '↑'}
        </button>
      </form>
    </div>
  )

  // Desktop : panel fixe dans le layout (géré par CSS)
  // Mobile : bottom sheet via portal
  return (
    <>
      {/* Desktop — intégré dans le layout watch via CSS */}
      <div className={`chat-desktop-panel${isOpen ? ' chat-desktop-panel--open' : ''}`}>
        {panel}
      </div>

      {/* Mobile — bottom sheet via portal */}
      {isOpen ? createPortal(
        <div className="chat-sheet-backdrop" onClick={onClose} aria-hidden="true">
          <div
            className="chat-sheet"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Chat en direct"
          >
            {panel}
          </div>
        </div>,
        document.body
      ) : null}
    </>
  )
}
