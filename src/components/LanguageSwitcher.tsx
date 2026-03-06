'use client'

import { useLanguage } from '@/i18n/LanguageContext'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { lang, setLang } = useLanguage()

    const isAr = lang === 'ar'

    return (
        <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: compact ? '5px 10px' : '7px 14px',
                border: '1.5px solid #E0D6C8',
                borderRadius: 100,
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: compact ? 12 : 13,
                fontWeight: 700,
                color: '#6B6058',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#C6A75E'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#C6A75E'
                    ; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(198,167,94,0.06)'
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E0D6C8'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#6B6058'
                    ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
        >
            {/* Globe icon */}
            <svg width={compact ? 13 : 15} height={compact ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {isAr ? 'EN' : 'ع'}
        </button>
    )
}
