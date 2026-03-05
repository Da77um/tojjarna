'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Rocket, Check, CreditCard, Layout, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
    { id: 'free', name: 'المجاني', price: '0', features: ['حتى 10 منتجات', 'طلبات غير محدودة', 'دعم الدفع عند الاستلام'], color: '#94A3B8' },
    { id: 'basic', name: 'الأساسي', price: '15', features: ['حتى 100 منتج', 'تحليلات المبيعات', 'كوبونات الخصم', 'إشعارات واتساب'], color: '#3B82F6', popular: true },
    { id: 'pro', name: 'الاحترافي', price: '35', features: ['منتجات غير محدودة', 'نطاق مخصص مجاني', 'ذكاء اصطناعي', 'تكامل الشحن'], color: '#6C3CE1' },
]

export default function SetupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [storeData, setStoreData] = useState({
        name: '',
        slug: '',
        plan_id: 'free'
    })

    const [realPlans, setRealPlans] = useState<any[]>([])

    useEffect(() => {
        async function fetchPlans() {
            const { data } = await supabase.from('plans').select('*').order('sort_order', { ascending: true })
            if (data) setRealPlans(data)
        }
        fetchPlans()
    }, [supabase])

    function handleSlugChange(name: string) {
        const slug = name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
        setStoreData(prev => ({ ...prev, name, slug }))
    }

    async function handleComplete() {
        setLoading(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('يرجى تسجيل الدخول أولاً')

            // Get plan UUID
            const selectedPlan = realPlans.find(p => PLANS.find(pl => pl.id === storeData.plan_id)?.name === p.name_ar) || realPlans[0]

            const { data, error: storeError } = await supabase.from('stores').insert({
                user_id: user.id,
                name_ar: storeData.name,
                slug: storeData.slug,
                plan_id: selectedPlan?.id,
                is_active: true,
                is_approved: true // Auto-approve for now
            }).select().single()

            if (storeError) throw storeError

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إعداد المتجر')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        boxShadow: '0 8px 16px rgba(108,60,225,0.2)'
                    }}>
                        <Rocket color="white" size={32} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12 }}>أهلاً بك في باسكت! لنجهز متجرك</h1>
                    <p style={{ color: '#6B7280' }}>خطوات بسيطة وسيكون متجرك جاهزاً لاستقبال الطلبات</p>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? '#6C3CE1' : '#E5E7EB',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
                        }}>1</div>
                        <span style={{ fontWeight: 700, color: step >= 1 ? '#111827' : '#9CA3AF' }}>معلومات المتجر</span>
                    </div>
                    <div style={{ width: 60, height: 2, background: '#E5E7EB', marginTop: 15 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? '#6C3CE1' : '#E5E7EB',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
                        }}>2</div>
                        <span style={{ fontWeight: 700, color: step >= 2 ? '#111827' : '#9CA3AF' }}>اختيار الخطة</span>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #E5E7EB', padding: 40, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {error && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: 16, borderRadius: 12, marginBottom: 24, fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>اسم المتجر *</label>
                                <input
                                    className="form-control"
                                    style={{ padding: '14px 16px', borderRadius: 12, fontSize: 16 }}
                                    placeholder="مثال: متجر الأزياء العصرية"
                                    value={storeData.name}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>رابط المتجر (Slug) *</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-control"
                                        style={{ padding: '14px 16px', paddingLeft: 160, borderRadius: 12, fontSize: 16, direction: 'ltr' }}
                                        placeholder="fashion-store"
                                        value={storeData.slug}
                                        onChange={(e) => setStoreData(prev => ({ ...prev, slug: e.target.value }))}
                                    />
                                    <div style={{
                                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9CA3AF', fontSize: 14, direction: 'ltr', pointerEvents: 'none'
                                    }}>
                                        basket.jo/store/
                                    </div>
                                </div>
                                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>هذا هو الرابط الذي سيستخدمه عملاؤك لزيارة متجرك</p>
                            </div>

                            <button
                                disabled={!storeData.name || !storeData.slug}
                                onClick={() => setStep(2)}
                                style={{
                                    marginTop: 12, width: '100%', background: '#6C3CE1', color: 'white', border: 'none',
                                    borderRadius: 14, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    opacity: (!storeData.name || !storeData.slug) ? 0.5 : 1
                                }}
                            >
                                التالي: اختيار الخطة <ArrowLeft size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                {PLANS.map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setStoreData(prev => ({ ...prev, plan_id: plan.id }))}
                                        style={{
                                            position: 'relative', padding: 20, borderRadius: 20, cursor: 'pointer', border: '2px solid',
                                            borderColor: storeData.plan_id === plan.id ? '#6C3CE1' : '#E5E7EB',
                                            background: storeData.plan_id === plan.id ? '#F5F3FF' : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {plan.popular && (
                                            <div style={{
                                                position: 'absolute', top: -12, right: '50%', transform: 'translateX(50%)',
                                                background: '#6C3CE1', color: 'white', padding: '4px 12px', borderRadius: 20,
                                                fontSize: 10, fontWeight: 900
                                            }}>الأكثر طلباً</div>
                                        )}
                                        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8, color: '#111827' }}>{plan.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                                            <span style={{ fontSize: 24, fontWeight: 900, color: '#6C3CE1' }}>{plan.price}</span>
                                            <span style={{ fontSize: 12, color: '#6B7280' }}>د.أ / شهر</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {plan.features.map(f => (
                                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' }}>
                                                    <Check size={14} color="#10B981" /> {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        flex: 1, background: 'white', color: '#6B7280', border: '1px solid #E5E7EB',
                                        borderRadius: 14, padding: '16px', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    رجوع
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleComplete}
                                    style={{
                                        flex: 2, background: '#10B981', color: 'white', border: 'none',
                                        borderRadius: 14, padding: '16px', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                    }}
                                >
                                    {loading ? 'جاري الإعداد...' : 'إتمام إعداد المتجر 🎉'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
