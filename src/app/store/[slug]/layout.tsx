import { createClient } from '@/lib/supabase/server'

import Link from 'next/link'

export default async function StorefrontLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('stores')
        .select('status')
        .eq('slug', slug)
        .single()

    if (!store) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🏷️</div>
                <h2 style={{ marginBottom: 16 }}>المتجر غير موجود</h2>
                <Link href="/" style={{ color: '#6C3CE1', fontWeight: 700 }}>العودة للرئيسية</Link>
            </div>
        )
    }

    if (store.status !== 'approved') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Noto Sans Arabic, Inter, sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🛠️</div>
                <h2 style={{ marginBottom: 8, color: '#111827', fontWeight: 900 }}>المتجر غير متاح حالياً</h2>
                <p style={{ color: '#6B7280', margin: 0, marginBottom: 24, fontSize: 16 }}>عذراً، هذا المتجر غير متاح في الوقت الحالي. يرجى المحاولة لاحقاً.</p>
                <Link href="/" style={{ background: '#6C3CE1', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>تصفح متاجر أخرى</Link>
            </div>
        )
    }

    return <>{children}</>
}
