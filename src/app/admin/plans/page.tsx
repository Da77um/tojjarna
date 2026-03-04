'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layers, Plus, Edit, CheckCircle, XCircle, Trash2, Save, X, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPlansPage() {
    const supabase = createClient()

    // Theme Config
    const primary = '#6C3CE1'
    const success = '#10B981'
    const danger = '#EF4444'
    const surface = '#161A28'
    const bgDark = '#0F111A'
    const borderDark = '#2D3348'
    const textBright = '#F3F4F6'
    const textMuted = '#9CA3AF'

    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)

    // Form state
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        price_jod: 0,
        commission_rate: 0,
        max_products: '', // String to handle 'unlimited' nicely in input
        is_active: true,
        features: [] as string[]
    })
    const [newFeature, setNewFeature] = useState('')

    useEffect(() => {
        fetchPlans()
    }, [supabase])

    async function fetchPlans() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('plans').select('*').order('sort_order', { ascending: true })
            if (error) throw error
            setPlans(data || [])
        } catch (err) {
            console.error("Error fetching plans", err)
            toast.error("حدث خطأ أثناء تحميل الباقات")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (plan: any = null) => {
        if (plan) {
            setEditingPlan(plan)
            setFormData({
                name_ar: plan.name_ar,
                name_en: plan.name_en,
                price_jod: plan.price_jod,
                commission_rate: plan.commission_rate,
                max_products: plan.max_products === null ? '' : plan.max_products.toString(),
                is_active: plan.is_active,
                features: plan.features || []
            })
        } else {
            setEditingPlan(null)
            setFormData({
                name_ar: '',
                name_en: '',
                price_jod: 0,
                commission_rate: 0,
                max_products: '',
                is_active: true,
                features: []
            })
        }
        setNewFeature('')
        setIsModalOpen(true)
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
            setNewFeature('')
        }
    }

    const removeFeature = (idx: number) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))
    }

    const handleSavePlan = async () => {
        try {
            const payload = {
                name_ar: formData.name_ar,
                name_en: formData.name_en,
                price_jod: Number(formData.price_jod),
                commission_rate: Number(formData.commission_rate),
                max_products: formData.max_products.trim() === '' ? null : Number(formData.max_products),
                features: formData.features,
                is_active: formData.is_active
            }

            if (editingPlan) {
                const { error } = await supabase.from('plans').update(payload).eq('id', editingPlan.id)
                if (error) throw error
                toast.success("تم تحديث الباقة بنجاح")
            } else {
                const { error } = await supabase.from('plans').insert([{ ...payload, sort_order: plans.length + 1 }])
                if (error) throw error
                toast.success("تم إنشاء الباقة بنجاح")
            }

            setIsModalOpen(false)
            fetchPlans()
        } catch (err) {
            console.error("Error saving plan:", err)
            toast.error("حدث خطأ أثناء حفظ الباقة")
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('plans').update({ is_active: !currentStatus }).eq('id', id)
            if (error) throw error
            setPlans(plans.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
            toast.success("تم تغيير حالة الباقة")
        } catch (err) {
            console.error(err)
            toast.error("فشل في تغيير الحالة")
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner" /></div>

    return (
        <div style={{ paddingBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: 'white' }}>الباقات والاشتراكات</h1>
                    <p style={{ margin: '8px 0 0 0', color: textMuted, fontSize: 15 }}>إدارة خطط الاشتراك وميزاتها وتسعيرها.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        background: primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8,
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
                        boxShadow: `0 4px 12px ${primary}40`, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> إضافة باقة جديدة
                </button>
            </div>

            {/* Plans Table */}
            <div style={{
                background: surface, borderRadius: 16, border: `1px solid ${borderDark}`, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${borderDark}`, background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13, width: 60 }}>#</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>اسم الباقة</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>التكلفة الشهرية</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>العمولة (٪)</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>حد المنتجات</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>الميزات</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>الحالة</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13, textAlign: 'center' }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan, i) => (
                                <tr key={plan.id} style={{ borderBottom: i === plans.length - 1 ? 'none' : `1px solid ${borderDark}`, transition: 'background 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 20px', color: textMuted }}>
                                        <Layers size={20} />
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: 700, color: textBright, fontSize: 14 }}>{plan.name_ar}</div>
                                        <div style={{ color: textMuted, fontSize: 12 }}>{plan.name_en}</div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, color: textBright, fontSize: 14 }}>
                                        {plan.price_jod === 0 ? 'مجاناً' : `${Number(plan.price_jod).toLocaleString('ar-JO')} د.أ`}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, color: textBright, fontSize: 14 }}>
                                        {plan.commission_rate}%
                                    </td>
                                    <td style={{ padding: '16px 20px', color: textMuted, fontSize: 13 }}>
                                        {plan.max_products === null ? 'غير محدود' : plan.max_products} منتج
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {plan.features?.slice(0, 2).map((feature: string, idx: number) => (
                                                <span key={idx} style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '2px 8px', borderRadius: 100, fontSize: 11 }}>
                                                    {feature}
                                                </span>
                                            ))}
                                            {plan.features?.length > 2 && (
                                                <span style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textMuted, padding: '2px 8px', borderRadius: 100, fontSize: 11 }}>
                                                    +{plan.features.length - 2} المزيد
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button
                                            onClick={() => toggleStatus(plan.id, plan.is_active)}
                                            style={{
                                                border: 'none', background: 'transparent', cursor: 'pointer',
                                                padding: '4px 10px',
                                                backgroundColor: plan.is_active ? `${success}15` : `${danger}15`,
                                                color: plan.is_active ? success : danger,
                                                borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
                                            }}>
                                            {plan.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {plan.is_active ? 'مفعل' : 'معطل'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: textMuted }} title="تعديل الباقة"
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = textBright}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = textMuted}
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: surface, width: '100%', maxWidth: 600, borderRadius: 20, border: `1px solid ${borderDark}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${borderDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'white' }}>
                                {editingPlan ? 'تعديل الباقة' : 'باقة اشتراك جديدة'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', padding: 4 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>اسم الباقة (عربي)</label>
                                    <input
                                        type="text" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                                        style={{ width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                        placeholder="مثال: الاحترافي"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>اسم الباقة (إنجليزي)</label>
                                    <input
                                        type="text" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                        style={{ width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                        placeholder="E.g. Pro"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>التكلفة الشهرية (د.أ)</label>
                                    <input
                                        type="number" value={formData.price_jod} onChange={e => setFormData({ ...formData, price_jod: Number(e.target.value) })}
                                        style={{ width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>نسبة العمولة للمنصة (٪)</label>
                                    <input
                                        type="number" step="0.1" value={formData.commission_rate} onChange={e => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                                        style={{ width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>الحد الأقصى للمنتجات</label>
                                <input
                                    type="number" value={formData.max_products} onChange={e => setFormData({ ...formData, max_products: e.target.value })}
                                    placeholder="اتركه فارغاً للعدد غير المحدود"
                                    style={{ width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                />
                                <div style={{ fontSize: 11, color: textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Info size={12} /> اترك الحقل فارغاً لجعل المنتجات غير محدودة.
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: `1px solid ${borderDark}`, margin: '24px 0' }} />

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textMuted, marginBottom: 8 }}>ميزات الباقة</label>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    <input
                                        type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                                        placeholder="أضف ميزة جديدة واضغط Enter..."
                                        style={{ flex: 1, background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px', borderRadius: 8, color: textBright, outline: 'none', fontSize: 14 }}
                                    />
                                    <button
                                        onClick={addFeature}
                                        style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '0 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>إضافة</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {formData.features.map((feature, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px', background: bgDark, border: `1px solid ${borderDark}`, borderRadius: 8
                                        }}>
                                            <span style={{ fontSize: 14 }}>{feature}</span>
                                            <button onClick={() => removeFeature(idx)} style={{ background: 'transparent', border: 'none', color: danger, cursor: 'pointer', padding: 4 }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.features.length === 0 && (
                                        <div style={{ padding: 20, textAlign: 'center', color: textMuted, fontSize: 13, border: `1px dashed ${borderDark}`, borderRadius: 8 }}>
                                            لا توجد ميزات مضافة بعد.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{
                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                        background: formData.is_active ? success : borderDark, borderRadius: 34, transition: '.4s'
                                    }}>
                                        <span style={{
                                            position: 'absolute', height: 18, width: 18, left: formData.is_active ? 22 : 4, bottom: 3,
                                            background: 'white', borderRadius: '50%', transition: '.4s'
                                        }} />
                                    </span>
                                </label>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>تفعيل الباقة</div>
                                    <div style={{ fontSize: 12, color: textMuted }}>الباقات غير المفعلة لن تظهر للمتاجر.</div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '20px 24px', borderTop: `1px solid ${borderDark}`, display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${borderDark}`, color: textBright, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>إلغاء</button>
                            <button
                                onClick={handleSavePlan}
                                disabled={!formData.name_ar || !formData.name_en}
                                style={{ padding: '10px 20px', background: primary, border: 'none', color: 'white', borderRadius: 8, cursor: (!formData.name_ar || !formData.name_en) ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, opacity: (!formData.name_ar || !formData.name_en) ? 0.5 : 1 }}>
                                <Save size={16} /> حفظ التغييرات
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
