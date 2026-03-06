'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Tag, Percent, DollarSign, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

export default function CouponsPage() {
    const supabase = createClient()
    const { t, dir } = useLanguage()
    const [search, setSearch] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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
            const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
            if (!stores || stores.length === 0) return
            const { data, error } = await supabase.from('coupons').select('*').in('store_id', stores.map(s => s.id)).order('created_at', { ascending: false })
            if (error) throw error
            setCoupons(data || [])
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    useEffect(() => { fetchCoupons() }, [supabase])

    const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))

    async function handleSave() {
        if (!code || !value) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: store } = await supabase.from('stores').select('id').eq('user_id', user?.id).single()
            const { error } = await supabase.from('coupons').insert({
                store_id: store?.id, code: code.toUpperCase(),
                type: type === 'percentage' ? 'percent' : 'fixed',
                value: Number(value), min_order: minOrder ? Number(minOrder) : null,
                usage_limit: limit ? Number(limit) : null, is_active: true
            })
            if (error) throw error
            setShowNew(false); setCode(''); setValue(''); setMinOrder(''); setLimit('')
            toast.success(t.coupons.savedSuccess)
            fetchCoupons()
        } catch {
            toast.error(t.coupons.saveFailed)
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        const { error } = await supabase.from('coupons').delete().eq('id', id)
        if (!error) { toast.success(t.coupons.deletedSuccess); fetchCoupons() }
        else toast.error(t.coupons.deleteFailed)
    }

    if (loading) return (
        <div className="page-container" dir={dir}>
            <div className="skeleton skeleton-text" style={{ width: 140, height: 22, marginBottom: 8 }} />
            {[1, 2, 3].map(i => <div key={i} className="skeleton mobile-card" style={{ marginBottom: 10, height: 80 }} />)}
        </div>
    )

    return (
        <div className="page-container" dir={dir}>
            <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">{t.coupons.title}</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{coupons.filter(c => c.is_active).length} {t.coupons.activeCoupons}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>
                    <Plus size={16} /> {t.coupons.addCoupon}
                </button>
            </div>

            {/* New coupon form */}
            {showNew && (
                <div className="card card-body" style={{ marginBottom: 20, borderTop: '3px solid #C6A75E' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>{t.coupons.newCoupon}</h3>

                    {/* Responsive form grid: stack on mobile */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t.coupons.couponCode}</label>
                            <input className="form-control" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="WELCOME20" dir="ltr" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t.coupons.discountType}</label>
                            <select className="form-control" value={type} onChange={e => setType(e.target.value as any)}>
                                <option value="percentage">{t.coupons.percentageType}</option>
                                <option value="fixed">{t.coupons.fixedType} ({t.common.currency})</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t.coupons.discountValue}</label>
                            <input className="form-control" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'percentage' ? '20' : '3.000'} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t.coupons.minOrder} ({t.common.currency})</label>
                            <input className="form-control" type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder={t.common.optional} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t.coupons.usageLimit}</label>
                            <input className="form-control" type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder={t.coupons.unlimited} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost" onClick={() => setShowNew(false)} disabled={saving} style={{ border: '1px solid #E0D6C8' }}>{t.common.cancel}</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? t.common.saving : t.coupons.saveCoupon}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mobile-search" style={{ marginBottom: 20 }}>
                <Search size={17} className="search-icon" />
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.coupons.searchPlaceholder} style={{ paddingRight: dir === 'rtl' ? 44 : 12, paddingLeft: dir === 'ltr' ? 44 : 12 }} />
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="card card-body" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <Tag size={40} color="#D4C8BB" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ color: '#6B6058', fontSize: 14 }}>{t.coupons.noCoupons}</p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="card hide-on-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {[t.coupons.code, t.coupons.discount, t.coupons.condition, t.coupons.usage, t.common.status, t.coupons.expiresAt, ''].map(h => (
                                        <th key={h} style={{ textAlign: dir === 'rtl' ? 'right' : 'left', padding: '14px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(coupon => (
                                    <tr key={coupon.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Tag size={14} color="#C6A75E" />
                                                <span style={{ fontWeight: 800, fontSize: 14, color: '#C6A75E', fontFamily: 'monospace' }}>{coupon.code}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 15 }}>
                                                {coupon.type === 'percent' ? <Percent size={14} color="#10B981" /> : <DollarSign size={14} color="#F59E0B" />}
                                                {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value.toFixed(3)} ${t.common.currency}`}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B6058' }}>{coupon.min_order ? t.coupons.above + ' ' + coupon.min_order + ' ' + t.common.currency : t.coupons.noLimit}</td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B6058' }}>
                                            {coupon.usage_count || 0} / {coupon.usage_limit ?? '∞'}
                                            {coupon.usage_limit && (
                                                <div style={{ height: 4, borderRadius: 4, background: '#E0D6C8', marginTop: 4, overflow: 'hidden', width: 60 }}>
                                                    <div style={{ height: '100%', background: (coupon.usage_count || 0) >= coupon.usage_limit ? '#EF4444' : '#C6A75E', width: `${Math.min(((coupon.usage_count || 0) / coupon.usage_limit) * 100, 100)}%`, borderRadius: 4 }} />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ background: coupon.is_active ? '#D1FAE5' : '#F3F4F6', color: coupon.is_active ? '#065F46' : '#374151', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                                                {coupon.is_active ? t.common.active : t.common.expired}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#A09080', fontSize: 12 }}>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString(dir === 'rtl' ? 'ar-JO' : 'en-US') : '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => setItemToDelete(coupon.id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #FEE2E2', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Trash2 size={14} color="#EF4444" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile coupon cards */}
                    <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                        {filtered.map(coupon => (
                            <div key={coupon.id} className="mobile-card">
                                {/* Top row: code + status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Tag size={16} color="#C6A75E" />
                                        <span style={{ fontWeight: 900, fontSize: 16, color: '#C6A75E', fontFamily: 'monospace', letterSpacing: dir === 'ltr' ? 1 : 0 }}>{coupon.code}</span>
                                    </div>
                                    <span style={{ background: coupon.is_active ? '#D1FAE5' : '#F3F4F6', color: coupon.is_active ? '#065F46' : '#374151', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                                        {coupon.is_active ? t.common.active : t.common.expired}
                                    </span>
                                </div>

                                {/* Info chips */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                    <span style={{ background: '#F5F0E8', color: '#111', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {coupon.type === 'percent' ? <Percent size={12} color="#10B981" /> : <DollarSign size={12} color="#F59E0B" />}
                                        {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value.toFixed(3)} ${t.common.currency}`}
                                    </span>
                                    {coupon.min_order && (
                                        <span style={{ background: '#F5F0E8', color: '#6B6058', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                            {t.coupons.above} {coupon.min_order} {t.common.currency}
                                        </span>
                                    )}
                                    <span style={{ background: '#F5F0E8', color: '#6B6058', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                        {coupon.usage_count || 0} / {coupon.usage_limit ?? '∞'} {t.coupons.usage}
                                    </span>
                                </div>

                                {/* Delete */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #F0EBE3' }}>
                                    <button onClick={() => setItemToDelete(coupon.id)} style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, minHeight: 40 }}>
                                        <Trash2 size={14} />{t.common.delete}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Delete confirmation modal */}
            {itemToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 0 0' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24, margin: '0 16px 24px', borderRadius: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertTriangle size={22} color="#EF4444" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{t.common.confirm}</h3>
                                <p style={{ fontSize: 14, color: '#6B6058', lineHeight: 1.6 }}>{t.coupons.deleteConfirm}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid #E0D6C8', minHeight: 48 }}>{t.common.cancel}</button>
                            <button onClick={() => { handleDelete(itemToDelete!); setItemToDelete(null) }} style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 48 }}>
                                {t.common.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
