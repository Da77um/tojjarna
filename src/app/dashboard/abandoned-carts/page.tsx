'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MessageCircle, Check, Clock, RefreshCw, Phone, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function AbandonedCartsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [carts, setCarts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'recovered'>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id).limit(1)
            if (!stores || stores.length === 0) { setLoading(false); return }
            const { data } = await supabase.from('abandoned_carts').select('*').eq('store_id', stores[0].id).order('created_at', { ascending: false })
            setCarts(data || [])
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const markRecovered = async (id: string) => {
        await supabase.from('abandoned_carts').update({ recovered: true }).eq('id', id)
        setCarts(prev => prev.map(c => c.id === id ? { ...c, recovered: true } : c))
        toast.success('تم تعليم السلة كمستردة')
    }

    const sendWhatsApp = async (cart: any) => {
        if (!cart.customer_phone) { toast.error('لا يوجد رقم هاتف للعميل'); return }
        const msg = encodeURIComponent(`مرحباً ${cart.customer_name || ''}، يبدو أنك تركت بعض المنتجات في سلة التسوق! إجمالي سلتك: ${Number(cart.total).toFixed(3)} د.أ — نحن نحتفظ بها لك 😊`)
        window.open(`https://wa.me/${cart.customer_phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
        await supabase.from('abandoned_carts').update({ recovery_sent: true }).eq('id', cart.id)
        setCarts(prev => prev.map(c => c.id === cart.id ? { ...c, recovery_sent: true } : c))
    }

    const filteredCarts = carts.filter(c => {
        const matchFilter = filter === 'all' || (filter === 'recovered' ? c.recovered : !c.recovered)
        const matchSearch = !search || c.customer_name?.toLowerCase().includes(search.toLowerCase()) || c.customer_phone?.includes(search)
        return matchFilter && matchSearch
    })

    const stats = {
        total: carts.length,
        pending: carts.filter(c => !c.recovered).length,
        recovered: carts.filter(c => c.recovered).length,
        totalValue: carts.filter(c => !c.recovered).reduce((acc, c) => acc + Number(c.total), 0),
    }

    if (loading) return (
        <div className="page-container" dir="rtl">
            <div className="mobile-grid-2" style={{ marginBottom: 20 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
            </div>
            {[1, 2, 3].map(i => <div key={i} className="skeleton mobile-card" style={{ marginBottom: 10, height: 100 }} />)}
        </div>
    )

    const statusBadge = (cart: any) => {
        if (cart.recovered)
            return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}><Check size={11} />مستردة</span>
        if (cart.recovery_sent)
            return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}><MessageCircle size={11} />تم الإرسال</span>
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}><Clock size={11} />قيد الانتظار</span>
    }

    return (
        <div className="page-container" dir="rtl">
            <div className="page-header">
                <div>
                    <h1 className="page-title">السلات المهجورة</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>تتبع واسترداد العملاء الذين لم يكملوا شراءهم</p>
                </div>
            </div>

            {/* Stats — 2×2 on mobile, 4-across on desktop */}
            <div className="mobile-grid-2" style={{ marginBottom: 20, gap: 12 }}>
                {[
                    { label: 'إجمالي السلات', value: stats.total, color: '#6C3CE1', bg: '#EDE9FE', icon: '🛒' },
                    { label: 'قيد الانتظار', value: stats.pending, color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
                    { label: 'تم الاسترداد', value: stats.recovered, color: '#10B981', bg: '#D1FAE5', icon: '✅' },
                    { label: 'قيمة متوقعة', value: `${stats.totalValue.toFixed(1)}`, sub: 'د.أ', color: '#3B82F6', bg: '#DBEAFE', icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="card card-body" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                            <span style={{ fontSize: 12, color: '#6B6058', fontWeight: 600, lineHeight: 1.3 }}>{s.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                            <span style={{ fontSize: 22, fontWeight: 900, color: '#111', lineHeight: 1 }}>{s.value}</span>
                            {s.sub && <span style={{ fontSize: 12, color: '#6B6058', fontWeight: 600 }}>{s.sub}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mobile-search" style={{ marginBottom: 12 }}>
                <Search size={17} className="search-icon" />
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." style={{ paddingRight: 44 }} />
            </div>

            {/* Filter chips */}
            <div className="chips-row" style={{ marginBottom: 20 }}>
                {[{ key: 'all', label: `الكل (${carts.length})` }, { key: 'pending', label: `انتظار (${stats.pending})` }, { key: 'recovered', label: `مُستردة (${stats.recovered})` }].map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key as any)} className={`chip ${filter === key ? 'active' : ''}`}>{label}</button>
                ))}
            </div>

            {/* Empty state */}
            {filteredCarts.length === 0 ? (
                <div className="card card-body" style={{ textAlign: 'center', padding: 60 }}>
                    <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>لا توجد سلات مهجورة</h3>
                    <p style={{ color: '#6B6058', fontSize: 14 }}>سيتم تسجيل السلات هنا عندما يترك العملاء منتجاتهم بدون إتمام الشراء</p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="card hide-on-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['العميل', 'المنتجات', 'الإجمالي', 'الحالة', 'التاريخ', 'الإجراءات'].map(h => (
                                        <th key={h} style={{ textAlign: 'right', padding: '12px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCarts.map(cart => {
                                    const items = Array.isArray(cart.cart_items) ? cart.cart_items : []
                                    return (
                                        <tr key={cart.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{cart.customer_name || '—'}</div>
                                                {cart.customer_phone && <div style={{ fontSize: 12, color: '#A09080', marginTop: 2, direction: 'ltr' }}>{cart.customer_phone}</div>}
                                            </td>
                                            <td style={{ padding: '14px 16px', color: '#6B6058', fontSize: 13 }}>{items.length} منتج</td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10B981' }}>{Number(cart.total).toFixed(3)} د.أ</td>
                                            <td style={{ padding: '14px 16px' }}>{statusBadge(cart)}</td>
                                            <td style={{ padding: '14px 16px', color: '#A09080', fontSize: 12 }}>{new Date(cart.created_at).toLocaleDateString('ar-JO')}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {!cart.recovered && (
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => sendWhatsApp(cart)} style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}>
                                                            <MessageCircle size={13} />واتساب
                                                        </button>
                                                        <button onClick={() => markRecovered(cart.id)} style={{ background: '#F5F0E8', color: '#6B6058', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}>
                                                            <RefreshCw size={12} />استُرد
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                        {filteredCarts.map(cart => {
                            const items = Array.isArray(cart.cart_items) ? cart.cart_items : []
                            return (
                                <div key={cart.id} className="mobile-card">
                                    {/* Top: name + status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{cart.customer_name || 'عميل مجهول'}</div>
                                            {cart.customer_phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#A09080', marginTop: 3, direction: 'ltr' }}>
                                                    <Phone size={11} />{cart.customer_phone}
                                                </div>
                                            )}
                                        </div>
                                        {statusBadge(cart)}
                                    </div>

                                    {/* Middle: products count + value */}
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                        <span style={{ background: '#F5F0E8', color: '#6B6058', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>🛒 {items.length} منتج</span>
                                        <span style={{ background: '#F5F0E8', color: '#10B981', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                                            {Number(cart.total).toFixed(2)} د.أ
                                        </span>
                                        <span style={{ fontSize: 12, color: '#A09080', marginRight: 'auto', alignSelf: 'center' }}>
                                            {new Date(cart.created_at).toLocaleDateString('ar-JO')}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    {!cart.recovered && (
                                        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #F0EBE3' }}>
                                            <button onClick={() => sendWhatsApp(cart)} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: 700, minHeight: 44 }}>
                                                <MessageCircle size={16} />واتساب
                                            </button>
                                            <button onClick={() => markRecovered(cart.id)} style={{ flex: 1, background: '#F5F0E8', color: '#4A4036', border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: 700, minHeight: 44 }}>
                                                <RefreshCw size={15} />استُردت
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
