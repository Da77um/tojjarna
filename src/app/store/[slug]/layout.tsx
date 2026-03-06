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
                <h2 style={{ marginBottom: 16, textAlign: 'center' }}>المتجر غير موجود<br /><span style={{ fontSize: 20, color: '#6B7280' }}>Store not found</span></h2>
                <Link href="/" style={{ color: '#222222', fontWeight: 700, borderBottom: '1.5px solid #222222', textDecoration: 'none' }}>العودة للرئيسية / Back to Home</Link>
            </div>
        )
    }

    if (store.status !== 'approved') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Tajawal, Inter, sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🛠️</div>
                <h2 style={{ marginBottom: 8, color: '#111827', fontWeight: 900, textAlign: 'center' }}>المتجر غير متاح حالياً<br /><span style={{ fontSize: 20, color: '#6B7280' }}>Store currently unavailable</span></h2>
                <p style={{ color: '#6B7280', margin: 0, marginBottom: 24, fontSize: 16, textAlign: 'center' }}>عذراً، هذا المتجر غير متاح في الوقت الحالي. يرجى المحاولة لاحقاً.<br />Sorry, this store is currently unavailable. Please try again later.</p>
                <Link href="/" style={{ background: '#222222', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>تصفح متاجر أخرى / Browse other stores</Link>
            </div>
        )
    }

    return <>{children}</>
}
