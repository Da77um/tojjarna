'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Rocket, Check, CreditCard, Layout, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [storeData, setStoreData] = useState({
        name: '',
        slug: '',
        plan_id: ''
    })

    const [realPlans, setRealPlans] = useState<any[]>([])

    useEffect(() => {
        async function fetchPlans() {
            const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true })
            if (data && data.length > 0) {
                setRealPlans(data)
                setStoreData(prev => ({ ...prev, plan_id: data[0].id }))
            }
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
            const selectedPlan = realPlans.find(p => p.id === storeData.plan_id) || realPlans[0]

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
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Tajawal, sans-serif' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: 16, background: '#F5F0E8', border: '1px solid #E0D6C8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    }}>
                        <Store color="#C6A75E" size={32} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111111', marginBottom: 12 }}>أهلاً بك في باسكت! لنجهز متجرك</h1>
                    <p style={{ color: '#6B6058' }}>خطوات بسيطة وسيكون متجرك جاهزاً لاستقبال الطلبات</p>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? '#222222' : '#E0D6C8',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
                        }}>1</div>
                        <span style={{ fontWeight: 700, color: step >= 1 ? '#111111' : '#A09080' }}>معلومات المتجر</span>
                    </div>
                    <div style={{ width: 60, height: 2, background: '#E0D6C8', marginTop: 15 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? '#222222' : '#E0D6C8',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
                        }}>2</div>
                        <span style={{ fontWeight: 700, color: step >= 2 ? '#111111' : '#A09080' }}>اختيار الخطة</span>
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
                                className="btn btn-primary"
                                style={{
                                    marginTop: 12, width: '100%',
                                    padding: '16px', fontSize: 16,
                                    opacity: (!storeData.name || !storeData.slug) ? 0.5 : 1
                                }}
                            >
                                التالي: اختيار الخطة <ArrowLeft size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                                {realPlans.map(plan => {
                                    let featuresList = []
                                    try {
                                        featuresList = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
                                    } catch (e) { }
                                    if (!Array.isArray(featuresList)) featuresList = []

                                    const isSelected = storeData.plan_id === plan.id;

                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => setStoreData(prev => ({ ...prev, plan_id: plan.id }))}
                                            style={{
                                                position: 'relative', padding: 24, borderRadius: 20, cursor: 'pointer', border: '2px solid',
                                                borderColor: isSelected ? '#C6A75E' : '#E0D6C8',
                                                background: isSelected ? '#FDFBF7' : 'white',
                                                transition: 'all 0.2s',
                                                boxShadow: isSelected ? '0 4px 20px rgba(198,167,94,0.15)' : 'none'
                                            }}
                                        >
                                            {plan.sort_order === 2 && (
                                                <div style={{
                                                    position: 'absolute', top: -12, right: '50%', transform: 'translateX(50%)',
                                                    background: '#222222', color: '#C6A75E', padding: '4px 14px', borderRadius: 20,
                                                    fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap'
                                                }}>الأكثر طلباً</div>
                                            )}
                                            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8, color: '#111111' }}>{plan.name_ar}</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                                                <span style={{ fontSize: 26, fontWeight: 900, color: '#222222' }}>{plan.price_jod}</span>
                                                <span style={{ fontSize: 12, color: '#6B6058' }}>د.أ / شهر</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {featuresList.map((f: string, i: number) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4A4036', fontWeight: 600 }}>
                                                        <Check size={16} color="#C6A75E" /> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                                <button
                                    onClick={() => setStep(1)}
                                    className="btn btn-ghost"
                                    style={{ flex: 1, padding: '16px', border: '1px solid #E0D6C8' }}
                                >
                                    رجوع
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleComplete}
                                    className="btn btn-primary"
                                    style={{ flex: 2, padding: '16px', fontSize: 16 }}
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
