import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
    params: Promise<{ slug: string; 'page-slug': string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, 'page-slug': pageSlug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase.from('stores').select('id, name_ar').eq('slug', slug).single()
    if (!store) return { title: 'الصفحة غير موجودة' }

    const { data: page } = await supabase.from('store_pages').select('title_ar, meta_title_ar, meta_description_ar').eq('store_id', store.id).eq('slug', pageSlug).eq('is_published', true).single()
    if (!page) return { title: 'الصفحة غير موجودة' }

    return {
        title: page.meta_title_ar || `${page.title_ar} — ${store.name_ar}`,
        description: page.meta_description_ar || undefined,
    }
}

export default async function StorefrontCmsPage({ params }: Props) {
    const { slug, 'page-slug': pageSlug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase.from('stores').select('id, name_ar, theme').eq('slug', slug).single()
    if (!store) notFound()

    const { data: page } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', store.id)
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .single()

    if (!page) notFound()

    const primaryColor = store.theme?.global?.primary_color || store.theme?.primary_color || '#6C3CE1'

    return (
        <div style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif', direction: 'rtl', minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={`/store/${slug}`} style={{ fontWeight: 900, fontSize: 20, color: primaryColor, textDecoration: 'none' }}>
                    {store.name_ar}
                </a>
                <a href={`/store/${slug}`} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>العودة للمتجر</a>
            </header>

            {/* Page content */}
            <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 24, lineHeight: 1.4 }}>
                    {page.title_ar}
                </h1>
                <div style={{ height: 3, width: 60, background: primaryColor, borderRadius: 2, marginBottom: 32 }} />
                {page.content_ar ? (
                    <div style={{ fontSize: 16, lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {page.content_ar}
                    </div>
                ) : (
                    <p style={{ color: '#9CA3AF', fontSize: 14 }}>لا يوجد محتوى لهذه الصفحة بعد.</p>
                )}
            </main>

            {/* Footer */}
            <footer style={{ background: '#111827', color: '#9CA3AF', padding: '24px', textAlign: 'center', marginTop: 80, fontSize: 13 }}>
                &copy; {new Date().getFullYear()} {store.name_ar} — جميع الحقوق محفوظة
            </footer>
        </div>
    )
}
