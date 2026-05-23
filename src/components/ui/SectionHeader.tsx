type SectionHeaderProps = {
  badge?: string
  title: string
  subtitle?: string
}

export function SectionHeader({ badge, title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      {badge ? (
        <p
          style={{
            margin: '0 0 10px',
            color: 'var(--color-accent-hi)',
            fontWeight: 900,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            fontSize: 13,
          }}
        >
          {badge}
        </p>
      ) : null}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.7rem, 4vw, 3rem)',
              lineHeight: 1,
            }}
          >
            {title}
          </h2>

          {subtitle ? (
            <p style={{ margin: '10px 0 0', color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
