function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '1rem',
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '1rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            marginBottom: '0.5rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-accent)" strokeWidth="2" />
            <polygon points="13,10 24,16 13,22" fill="var(--color-accent)" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Animelist
        </h1>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', margin: 0 }}>
          Ta bibliothèque anime, sans compromis.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          Lot 0 ✓ — Bootstrap complet
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {['Vite 8', 'React 18', 'Tailwind v4', 'Supabase', 'Netlify'].map((tag) => (
            <span
              key={tag}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                background: 'var(--color-surface-hi)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '20rem',
          height: '2px',
          borderRadius: '9999px',
          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-hi))',
        }}
      />
    </div>
  )
}

export default App
