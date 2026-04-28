'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Check, ArrowLeft, ArrowRight, Rocket, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [realPlans, setRealPlans] = useState<any[]>([])
  const [storeData, setStoreData] = useState({ name: '', slug: '', plan_id: '' })

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      if (data?.length) {
        setRealPlans(data)
        setStoreData(prev => ({ ...prev, plan_id: data[0].id }))
      }
    }
    fetchPlans()
  }, [])

  function handleNameChange(name: string) {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    setStoreData(prev => ({ ...prev, name, slug }))
  }

  async function handleComplete() {
    setLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('يرجى تسجيل الدخول أولاً')
      const selectedPlan = realPlans.find(p => p.id === storeData.plan_id) || realPlans[0]
      const { error: storeError } = await supabase.from('stores').insert({
        user_id: user.id, name_ar: storeData.name, slug: storeData.slug,
        plan_id: selectedPlan?.id, is_active: true, is_approved: true,
      })
      if (storeError) throw storeError
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إعداد المتجر')
    } finally { setLoading(false) }
  }

  const steps = [
    { n: 1, label: 'معلومات المتجر' },
    { n: 2, label: 'اختيار الخطة' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Store color="#6C3CE1" size={30} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>أهلاً بك! لنجهز متجرك</h1>
          <p style={{ color: '#6B7280', fontSize: 15 }}>خطوتان بسيطتان وسيكون متجرك جاهزاً لاستقبال الطلبات</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {steps.map((s, idx) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, flexShrink: 0,
                  background: step > s.n ? '#6C3CE1' : step === s.n ? '#6C3CE1' : '#E5E7EB',
                  color: step >= s.n ? '#fff' : '#9CA3AF',
                  boxShadow: step === s.n ? '0 0 0 4px rgba(108,60,225,0.15)' : 'none',
                }}>
                  {step > s.n ? <Check size={16} /> : s.n}
                </div>
                <span style={{ fontWeight: 700, color: step >= s.n ? '#0F172A' : '#9CA3AF', fontSize: 14, whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ width: 60, height: 2, background: step > s.n ? '#6C3CE1' : '#E5E7EB', margin: '0 16px', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '36px 40px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>معلومات متجرك</h2>
                <p style={{ fontSize: 14, color: '#6B7280' }}>أدخل اسم متجرك وسيتم إنشاء الرابط تلقائياً</p>
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>اسم المتجر <span style={{ color: '#DC2626' }}>*</span></label>
                <input value={storeData.name} onChange={e => handleNameChange(e.target.value)} placeholder="مثال: متجر الأزياء العصرية"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 16, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>رابط المتجر <span style={{ color: '#DC2626' }}>*</span></label>
                <div style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}
                  onFocus={() => {}}
                  onBlur={() => {}}>
                  <div style={{ padding: '13px 14px', background: '#F7F8FA', color: '#9CA3AF', fontSize: 13, whiteSpace: 'nowrap', borderLeft: '1px solid #E5E7EB', direction: 'ltr' }}>
                    tojjarna.com/
                  </div>
                  <input value={storeData.slug} onChange={e => setStoreData(prev => ({ ...prev, slug: e.target.value }))} placeholder="my-store" dir="ltr"
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 14px', fontSize: 15, background: 'transparent', fontFamily: 'inherit', fontWeight: 600 }}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>هذا هو الرابط الذي سيستخدمه عملاؤك للوصول لمتجرك</p>
              </div>
              <button onClick={() => setStep(2)} disabled={!storeData.name || !storeData.slug}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 12, background: '#6C3CE1', color: '#fff', fontWeight: 800, fontSize: 16, border: 'none', cursor: storeData.name && storeData.slug ? 'pointer' : 'not-allowed', opacity: storeData.name && storeData.slug ? 1 : 0.5, boxShadow: '0 4px 14px rgba(108,60,225,0.25)' }}>
                التالي: اختيار الخطة <ArrowLeft size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>اختر خطتك</h2>
                <p style={{ fontSize: 14, color: '#6B7280' }}>يمكنك ترقية أو تغيير خطتك في أي وقت</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {realPlans.map((plan, idx) => {
                  let featuresList: string[] = []
                  try { featuresList = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features } catch {}
                  if (!Array.isArray(featuresList)) featuresList = []
                  const isSelected = storeData.plan_id === plan.id
                  const isPopular = plan.sort_order === 2

                  return (
                    <div key={plan.id} onClick={() => setStoreData(prev => ({ ...prev, plan_id: plan.id }))}
                      style={{ position: 'relative', padding: '20px 22px', borderRadius: 16, cursor: 'pointer', border: '2px solid', transition: 'all 0.2s',
                        borderColor: isSelected ? '#6C3CE1' : '#E5E7EB',
                        background: isSelected ? '#EDE9FB' : '#fff',
                        boxShadow: isSelected ? '0 4px 20px rgba(108,60,225,0.12)' : 'none',
                      }}>
                      {isPopular && (
                        <div style={{ position: 'absolute', top: -11, right: '50%', transform: 'translateX(50%)', background: '#F97316', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                          الأكثر طلباً
                        </div>
                      )}
                      <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 8, color: '#0F172A' }}>{plan.name_ar}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color: isSelected ? '#6C3CE1' : '#0F172A' }}>{plan.price_jod}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>د.أ / شهر</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {featuresList.slice(0, 5).map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                            <Check size={14} color={isSelected ? '#6C3CE1' : '#16A34A'} /> {f}
                          </div>
                        ))}
                      </div>
                      {isSelected && (
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: '#6C3CE1', fontSize: 13, fontWeight: 700 }}>
                          <Check size={14} /> محدد
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ArrowRight size={16} /> رجوع
                </button>
                <button onClick={handleComplete} disabled={loading}
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: '#6C3CE1', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(108,60,225,0.25)' }}>
                  <Rocket size={18} />
                  {loading ? 'جاري الإعداد...' : 'إطلاق متجري 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
