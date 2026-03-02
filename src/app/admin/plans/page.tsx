'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, DollarSign, Percent, Package, ListChecks, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminPlansPage() {
    const supabase = createClient()
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPlans()
    }, [])

    async function fetchPlans() {
        setLoading(true)
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .order('sort_order', { ascending: true })
        if (data) setPlans(data)
        setLoading(false)
    }

    async function handleUpdatePlan(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const { error } = await supabase
            .from('plans')
            .update({
                name_ar: editingPlan.name_ar,
                name_en: editingPlan.name_en,
                price_jod: Number(editingPlan.price_jod),
                commission_rate: Number(editingPlan.commission_rate),
                max_products: editingPlan.max_products ? Number(editingPlan.max_products) : null,
                features: typeof editingPlan.features === 'string' ? JSON.parse(editingPlan.features) : editingPlan.features,
                is_active: editingPlan.is_active,
                sort_order: Number(editingPlan.sort_order)
            })
            .eq('id', editingPlan.id)

        if (!error) {
            setEditingPlan(null)
            fetchPlans()
        } else {
            toast.error('حدث خطأ أثناء تحديث الخطة: ' + error.message)
        }
        setSaving(false)
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                        خطط الاشتراك
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        إدارة خطط الاشتراك والعمولات لمنصة باسكت
                    </p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={18} />
                    إضافة خطة جديدة
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="card"
                        style={{
                            position: 'relative',
                            border: editingPlan?.id === plan.id ? '1px solid #6C3CE1' : '1px solid var(--border)',
                            background: editingPlan?.id === plan.id ? 'rgba(108,60,225,0.05)' : 'var(--surface)'
                        }}
                    >
                        <div style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 800 }}>{plan.name_ar}</h3>
                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>{plan.name_en}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {plan.is_active ? (
                                            <span style={{ color: '#10B981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                                <CheckCircle size={12} /> نشطة
                                            </span>
                                        ) : (
                                            <span style={{ color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                                <XCircle size={12} /> معطلة
                                            </span>
                                        )}
                                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>الترتيب: {plan.sort_order}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingPlan({ ...plan, features: JSON.stringify(plan.features, null, 2) })}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <DollarSign size={10} /> السعر الشهري
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 800 }}>{plan.price_jod} <span style={{ fontSize: 12 }}>د.أ</span></div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Percent size={10} /> العمولة
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 800 }}>%{plan.commission_rate}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ListChecks size={14} /> المميزات
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {plan.features.map((feature: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C3CE1' }} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Package size={14} />
                                    {plan.max_products ? `الحد الأقصى: ${plan.max_products} منتج` : 'منتجات غير محدودة'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal / Drawer Overlay */}
            {editingPlan && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: 500,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800 }}>تعديل خطة {editingPlan.name_ar}</h2>
                            <button onClick={() => setEditingPlan(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePlan} style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label className="form-label">الاسم (عربي)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPlan.name_ar}
                                        onChange={e => setEditingPlan({ ...editingPlan, name_ar: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Name (EN)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPlan.name_en}
                                        onChange={e => setEditingPlan({ ...editingPlan, name_en: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label className="form-label">السعر (د.أ)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        className="form-control"
                                        value={editingPlan.price_jod}
                                        onChange={e => setEditingPlan({ ...editingPlan, price_jod: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">العمولة (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={editingPlan.commission_rate}
                                        onChange={e => setEditingPlan({ ...editingPlan, commission_rate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">أقصى عدد من المنتجات (اتركه فارغاً للا محدود)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={editingPlan.max_products || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, max_products: e.target.value || null })}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label">المميزات (JSON Array)</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={editingPlan.features}
                                    onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value })}
                                    style={{ fontFamily: 'monospace', fontSize: 13 }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={editingPlan.is_active}
                                        onChange={e => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                                    />
                                    <span style={{ fontSize: 14 }}>خطة نشطة</span>
                                </label>
                                <div>
                                    <label className="form-label" style={{ marginBottom: 0, marginLeft: 8 }}>الترتيب:</label>
                                    <input
                                        type="number"
                                        style={{ width: 60, display: 'inline-block' }}
                                        className="form-control"
                                        value={editingPlan.sort_order}
                                        onChange={e => setEditingPlan({ ...editingPlan, sort_order: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                                    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </button>
                                <button type="button" onClick={() => setEditingPlan(null)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
