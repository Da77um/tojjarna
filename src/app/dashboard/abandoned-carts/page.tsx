'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MessageCircle, Check, Clock, RefreshCw, Phone, Mail, Search, Filter, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AbandonedCartsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [carts, setCarts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [storeId, setStoreId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'recovered'>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id).limit(1)
            if (!stores || stores.length === 0) { setLoading(false); return }

            const sid = stores[0].id
            setStoreId(sid)

            const { data } = await supabase
                .from('abandoned_carts')
                .select('*')
                .eq('store_id', sid)
                .order('created_at', { ascending: false })

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

    if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">السلات المهجورة</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>تتبع واسترداد العملاء الذين لم يكملوا شراءهم</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'إجمالي السلات', value: stats.total, color: '#6C3CE1', bg: '#EDE9FE' },
                    { label: 'قيد الانتظار', value: stats.pending, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'تم الاسترداد', value: stats.recovered, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'قيمة متوقعة', value: `${stats.totalValue.toFixed(3)} د.أ`, color: '#3B82F6', bg: '#DBEAFE' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>
                            <ShoppingCart size={22} color={s.color} />
                        </div>
                        <div>
                            <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                    <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." style={{ paddingRight: 38 }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[{ key: 'all', label: 'الكل' }, { key: 'pending', label: 'قيد الانتظار' }, { key: 'recovered', label: 'مُستردة' }].map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key as any)} style={{
                            padding: '7px 14px', borderRadius: 9, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            borderColor: filter === key ? 'var(--primary)' : 'var(--border)',
                            background: filter === key ? 'var(--primary)' : 'transparent',
                            color: filter === key ? 'white' : 'var(--text-secondary)',
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filteredCarts.length === 0 ? (
                <div className="card card-body" style={{ textAlign: 'center', padding: 60 }}>
                    <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>لا توجد سلات مهجورة</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {filter === 'all' ? 'سيتم تسجيل السلات هنا عندما يترك العملاء منتجاتهم بدون إتمام الشراء' : 'لا توجد نتائج تطابق الفلتر المحدد'}
                    </p>
                </div>
            ) : (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['العميل', 'المنتجات', 'الإجمالي', 'الحالة', 'التاريخ', 'الإجراءات'].map(h => (
                                    <th key={h} style={{ textAlign: 'right', padding: '12px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCarts.map((cart) => {
                                const items = Array.isArray(cart.cart_items) ? cart.cart_items : []
                                return (
                                    <tr key={cart.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{cart.customer_name || '—'}</div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                                                {cart.customer_phone && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={11} />{cart.customer_phone}</span>}
                                                {cart.customer_email && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={11} />{cart.customer_email}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>{items.length} منتج</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10B981' }}>{Number(cart.total).toFixed(3)} د.أ</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {cart.recovered ? (
                                                <span className="badge" style={{ background: '#D1FAE5', color: '#065F46', gap: 5 }}><Check size={11} />مستردة</span>
                                            ) : cart.recovery_sent ? (
                                                <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', gap: 5 }}><MessageCircle size={11} />تم الإرسال</span>
                                            ) : (
                                                <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', gap: 5 }}><Clock size={11} />قيد الانتظار</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                                            {new Date(cart.created_at).toLocaleDateString('ar-JO')}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {!cart.recovered && (
                                                    <>
                                                        <button onClick={() => sendWhatsApp(cart)} className="btn btn-sm" style={{
                                                            background: '#25D366', color: 'white', border: 'none', gap: 4, fontSize: 12
                                                        }}>
                                                            <MessageCircle size={13} /> واتساب
                                                        </button>
                                                        <button onClick={() => markRecovered(cart.id)} className="btn btn-sm btn-secondary" style={{ fontSize: 12, gap: 4 }}>
                                                            <RefreshCw size={12} /> استُرد
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
