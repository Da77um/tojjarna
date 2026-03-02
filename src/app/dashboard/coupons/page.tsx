'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Tag, Percent, DollarSign, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CouponsPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    // Form states
    const [code, setCode] = useState('')
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
    const [value, setValue] = useState('')
    const [minOrder, setMinOrder] = useState('')
    const [limit, setLimit] = useState('')
    const [coupons, setCoupons] = useState<any[]>([])

    async function fetchCoupons() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: stores } = await supabase
                .from('stores')
                .select('id')
                .eq('user_id', user.id)

            if (!stores || stores.length === 0) return
            const storeIds = stores.map(s => s.id)

            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .in('store_id', storeIds)
                .order('created_at', { ascending: false })

            if (error) throw error
            setCoupons(data || [])
        } catch (err) {
            console.error('Error fetching coupons:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [supabase])

    const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))

    async function handleSave() {
        if (!code || !value) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: store } = await supabase.from('stores').select('id').eq('user_id', user?.id).single()

            const { error } = await supabase.from('coupons').insert({
                store_id: store?.id,
                code: code.toUpperCase(),
                discount_type: type,
                discount_value: Number(value),
                min_order_amount: minOrder ? Number(minOrder) : null,
                usage_limit: limit ? Number(limit) : null,
                is_active: true
            })

            if (error) throw error

            setShowNew(false)
            setCode('')
            setValue('')
            setMinOrder('')
            setLimit('')
            toast.success('تم حفظ الكوبون بنجاح')
            fetchCoupons()
        } catch (err) {
            console.error('Error saving coupon:', err)
            toast.error('حدث خطأ أثناء حفظ الكوبون. يرجى المحاولة مرة أخرى.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id)
            if (error) throw error
            toast.success('تم حذف الكوبون بنجاح')
            fetchCoupons()
        } catch (err) {
            console.error('Error deleting coupon:', err)
            toast.error('حدث خطأ أثناء حذف الكوبون')
        }
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">الكوبونات والخصومات</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {coupons.filter(c => c.is_active).length} كوبونات نشطة
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                    <Plus size={16} />
                    إنشاء كوبون
                </button>
            </div>

            {/* New coupon form */}
            {showNew && (
                <div className="card card-body" style={{ marginBottom: 24, border: '2px solid var(--primary)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>كوبون جديد</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">كود الكوبون *</label>
                            <input className="form-control" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="مثال: WELCOME20" dir="ltr" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">نوع الخصم</label>
                            <select className="form-control" value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}>
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (د.أ)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">قيمة الخصم *</label>
                            <input className="form-control" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percentage' ? '20' : '3.000'} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">حد أدنى للطلب (د.أ)</label>
                            <input className="form-control" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="اختياري" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">حد الاستخدام</label>
                            <input className="form-control" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="غير محدود" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button className="btn btn-ghost" onClick={() => setShowNew(false)} disabled={saving}>إلغاء</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'جاري الحفظ...' : 'حفظ الكوبون'}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 380 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }} />
                <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن كوبون..." style={{ paddingRight: 42 }} />
            </div>

            {/* Coupons table */}
            <div className="card">
                {filtered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>لا توجد كوبونات للعرض</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['الكود', 'الخصم', 'شرط', 'الاستخدام', 'الحالة', 'انتهاء الصلاحية', ''].map((h) => (
                                    <th key={h} style={{ textAlign: 'right', padding: '14px 20px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((coupon) => (
                                <tr key={coupon.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Tag size={14} color="var(--primary)" />
                                            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5, color: 'var(--primary)', fontFamily: 'monospace' }}>{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 15 }}>
                                            {coupon.discount_type === 'percentage' ? <Percent size={14} color="#10B981" /> : <DollarSign size={14} color="#F59E0B" />}
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value.toFixed(3)} د.أ`}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {coupon.min_order_amount ? `فوق ${coupon.min_order_amount} د.أ` : 'بدون حد'}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {coupon.used_count || 0} / {coupon.usage_limit ?? '∞'}
                                        </div>
                                        {coupon.usage_limit && (
                                            <div style={{ height: 4, borderRadius: 4, background: 'var(--surface-2)', marginTop: 4, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: (coupon.used_count || 0) >= coupon.usage_limit ? '#EF4444' : 'var(--primary)', width: `${Math.min(((coupon.used_count || 0) / coupon.usage_limit) * 100, 100)}%`, borderRadius: 4 }} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span className={`badge ${coupon.is_active ? 'badge-success' : 'badge-gray'}`}>
                                            {coupon.is_active ? 'نشط' : 'منتهي'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('ar-JO') : '—'}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <button
                                            onClick={() => setItemToDelete(coupon.id)}
                                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={14} color="#EF4444" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {itemToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, margin: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertTriangle size={24} color="#EF4444" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>تأكيد الحذف</h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>هل أنت متأكد من حذف هذا الكوبون نهائياً؟ لا يمكن التراجع عن هذا الإجراء وسيتم إلغاء تفعيله للعملاء.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>إلغاء</button>
                            <button
                                onClick={() => {
                                    handleDelete(itemToDelete);
                                    setItemToDelete(null);
                                }}
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                            >
                                نعم، احذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
