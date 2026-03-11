import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function StorefrontLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Use admin client (bypasses RLS) to always find the store regardless of approval
    const adminClient = createAdminClient()
    const { data: store } = await adminClient
        .from('stores')
        .select('id, user_id, is_approved, is_active')
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

    // Store is publicly accessible if both flags are true
    if (store.is_active && store.is_approved) {
        return <>{children}</>
    }

    // Store is not public — check if the logged-in user is the owner
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    const isOwner = user?.id === store.user_id

    if (!isOwner) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Tajawal, Inter, sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🛠️</div>
                <h2 style={{ marginBottom: 8, color: '#111827', fontWeight: 900, textAlign: 'center' }}>المتجر غير متاح حالياً<br /><span style={{ fontSize: 20, color: '#6B7280' }}>Store currently unavailable</span></h2>
                <p style={{ color: '#6B7280', margin: 0, marginBottom: 24, fontSize: 16, textAlign: 'center' }}>عذراً، هذا المتجر غير متاح في الوقت الحالي.<br />Sorry, this store is currently unavailable.</p>
                <Link href="/" style={{ background: '#222222', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>تصفح متاجر أخرى / Browse other stores</Link>
            </div>
        )
    }

    // Owner preview — show with a notice banner
    return (
        <div style={{ fontFamily: 'Tajawal, Inter, sans-serif' }}>
            <div style={{
                background: '#FEF3C7', color: '#92400E',
                padding: '12px 20px', textAlign: 'center',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                borderBottom: '1px solid #FCD34D',
            }}>
                <span>🔒</span>
                <span>متجرك قيد المراجعة — هذا عرض أولي خاص بك فقط / Your store is under review — this is a private preview</span>
                <Link href="/dashboard" style={{ color: '#92400E', fontWeight: 800, borderBottom: '1.5px solid #92400E', textDecoration: 'none', marginInlineStart: 8 }}>
                    لوحة التحكم / Dashboard
                </Link>
            </div>
            {children}
        </div>
    )
}
