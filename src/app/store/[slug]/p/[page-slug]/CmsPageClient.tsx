'use client'

import { useLanguage } from '@/i18n/LanguageContext'

export default function CmsPageClient({
    store,
    page,
    slug
}: {
    store: any
    page: any
    slug: string
}) {
    const { t, dir } = useLanguage()
    const primaryColor = store.theme?.global?.primary_color || store.theme?.primary_color || '#6C3CE1'

    const title = dir === 'rtl' ? page.title_ar : page.title_en || page.title_ar
    const content = dir === 'rtl' ? page.content_ar : page.content_en || page.content_ar

    return (
        <div style={{ fontFamily: 'Tajawal, Inter, sans-serif', direction: dir as 'rtl' | 'ltr', minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={`/store/${slug}`} style={{ fontWeight: 900, fontSize: 20, color: primaryColor, textDecoration: 'none' }}>
                    {dir === 'rtl' ? store.name_ar : store.name_en || store.name_ar || store.name}
                </a>
                <a href={`/store/${slug}`} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>{t.storefront.backToStore}</a>
            </header>

            {/* Page content */}
            <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 24, lineHeight: 1.4 }}>
                    {title}
                </h1>
                <div style={{ height: 3, width: 60, background: primaryColor, borderRadius: 2, marginBottom: 32 }} />
                {content ? (
                    <div style={{ fontSize: 16, lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {content}
                    </div>
                ) : (
                    <p style={{ color: '#9CA3AF', fontSize: 14 }}>{t.storefront.noContentYet}</p>
                )}
            </main>

            {/* Footer */}
            <footer style={{ background: '#111827', color: '#9CA3AF', padding: '24px', textAlign: 'center', marginTop: 80, fontSize: 13, direction: dir as 'rtl' | 'ltr', display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>&copy; {new Date().getFullYear()} {dir === 'rtl' ? store.name_ar : store.name_en || store.name_ar || store.name} — {t.storefront.allRightsReserved}</span>
            </footer>
        </div>
    )
}
