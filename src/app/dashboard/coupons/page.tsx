'use client'

import { useState } from 'react'
import { Search, Plus, Tag, Percent, DollarSign, Trash2 } from 'lucide-react'

const coupons = [
    { id: '1', code: 'WELCOME20', type: 'percent', value: 20, minOrder: 25, usageLimit: 100, used: 34, active: true, expires: '2025-04-01' },
    { id: '2', code: 'SHIP3', type: 'fixed', value: 3, minOrder: null, usageLimit: null, used: 12, active: true, expires: null },
    { id: '3', code: 'SUMMER10', type: 'percent', value: 10, minOrder: 50, usageLimit: 50, used: 50, active: false, expires: '2025-03-01' },
]

export default function CouponsPage() {
    const [search, setSearch] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [code, setCode] = useState('')
    const [type, setType] = useState<'percent' | 'fixed'>('percent')
    const [value, setValue] = useState('')
    const [minOrder, setMinOrder] = useState('')
    const [limit, setLimit] = useState('')

    const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">الكوبونات والخصومات</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{coupons.length} كوبونات نشطة</p>
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
                            <select className="form-control" value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}>
                                <option value="percent">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت (د.أ)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">قيمة الخصم *</label>
                            <input className="form-control" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percent' ? '20' : '3.000'} />
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
                        <button className="btn btn-ghost" onClick={() => setShowNew(false)}>إلغاء</button>
                        <button className="btn btn-primary">حفظ الكوبون</button>
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
                                        {coupon.type === 'percent' ? <Percent size={14} color="#10B981" /> : <DollarSign size={14} color="#F59E0B" />}
                                        {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} د.أ`}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {coupon.minOrder ? `فوق ${coupon.minOrder} د.أ` : 'بدون حد'}
                                </td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {coupon.used} / {coupon.usageLimit ?? '∞'}
                                    </div>
                                    {coupon.usageLimit && (
                                        <div style={{ height: 4, borderRadius: 4, background: 'var(--surface-2)', marginTop: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: coupon.used >= coupon.usageLimit ? '#EF4444' : 'var(--primary)', width: `${Math.min((coupon.used / coupon.usageLimit) * 100, 100)}%`, borderRadius: 4 }} />
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span className={`badge ${coupon.active ? 'badge-success' : 'badge-gray'}`}>
                                        {coupon.active ? 'نشط' : 'منتهي'}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                                    {coupon.expires ?? '—'}
                                </td>
                                <td style={{ padding: '14px 20px' }}>
                                    <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Trash2 size={14} color="#EF4444" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
