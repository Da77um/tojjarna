'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight, MapPin, CreditCard, Package } from 'lucide-react'

type Step = 'address' | 'payment' | 'confirm'
const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
    { key: 'address', label: 'العنوان', icon: MapPin },
    { key: 'payment', label: 'الدفع', icon: CreditCard },
    { key: 'confirm', label: 'تأكيد', icon: Package },
]

const CITIES = ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'الكرك', 'السلط', 'مأدبا', 'جرش', 'عجلون']

const cartSummary = [
    { name: 'قميص قطني أبيض', variant: 'L — أبيض', price: 25.0, qty: 2 },
    { name: 'عطر فرنسي', variant: '50ml', price: 55.0, qty: 1 },
]

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const unwrappedParams = use(params)
    const slug = unwrappedParams.slug
    const [step, setStep] = useState<Step>('address')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [address, setAddress] = useState('')
    const [notes, setNotes] = useState('')
    const [payment, setPayment] = useState<'cod' | 'card'>('cod')
    const [placing, setPlacing] = useState(false)
    const [placed, setPlaced] = useState(false)

    const primaryColor = '#6C3CE1'
    const subtotal = cartSummary.reduce((s, i) => s + i.price * i.qty, 0)
    const shipping = subtotal >= 50 ? 0 : 3.0
    const total = subtotal + shipping

    const placeOrder = async () => {
        setPlacing(true)
        await new Promise((r) => setTimeout(r, 1600))
        setPlacing(false)
        setPlaced(true)
    }

    const currentStep = STEPS.findIndex((s) => s.key === step)

    // Order placed success screen
    if (placed) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Noto Sans Arabic, sans-serif', background: '#FAFAFA', padding: 20 }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={48} color="#10B981" />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12 }}>تم قبول طلبك! 🎉</h1>
                <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                    شكراً لك! سيتم التواصل معك على رقم <strong>{phone}</strong> خلال ساعة لتأكيد الطلب.
                </p>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, margin: '24px 0', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>تفاصيل الطلب</div>
                    {cartSummary.map((i) => (
                        <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                            <span>{i.name} ({i.qty}x)</span>
                            <span style={{ fontWeight: 600 }}>{(i.price * i.qty).toFixed(2)} د.أ</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16 }}>
                        <span>الإجمالي</span>
                        <span style={{ color: primaryColor }}>{total.toFixed(2)} د.أ</span>
                    </div>
                </div>
                <Link href={`/store/${slug}`} style={{ display: 'block', background: primaryColor, color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                    العودة للمتجر
                </Link>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Noto Sans Arabic, sans-serif', padding: '32px 20px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                {/* Steps indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
                    {STEPS.map((s, i) => {
                        const Icon = s.icon
                        const done = i < currentStep
                        const active = i === currentStep
                        return (
                            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: done ? '#D1FAE5' : active ? primaryColor : 'white',
                                        border: `2px solid ${done ? '#10B981' : active ? primaryColor : '#E5E7EB'}`,
                                    }}>
                                        {done ? <CheckCircle size={20} color="#10B981" /> : <Icon size={18} color={active ? 'white' : '#9CA3AF'} />}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? primaryColor : '#9CA3AF' }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ width: 80, height: 2, background: i < currentStep ? '#10B981' : '#E5E7EB', margin: '0 8px', marginBottom: 22 }} />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                    {/* Form */}
                    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', padding: 28 }}>
                        {step === 'address' && (
                            <>
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>بيانات التوصيل</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">الاسم الكامل *</label>
                                        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك الكامل" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">رقم الهاتف *</label>
                                        <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xxxxxxxx" dir="ltr" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">المحافظة *</label>
                                        <select className="form-control" value={city} onChange={(e) => setCity(e.target.value)}>
                                            <option value="">اختر المحافظة</option>
                                            {CITIES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">العنوان التفصيلي *</label>
                                        <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الحي، الشارع، رقم البناء..." />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">ملاحظات للمندوب</label>
                                        <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي توضيحات إضافية..." />
                                    </div>
                                </div>
                                <button
                                    disabled={!name || !phone || !city || !address}
                                    onClick={() => setStep('payment')}
                                    style={{ marginTop: 24, width: '100%', background: primaryColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: (!name || !phone || !city || !address) ? 'not-allowed' : 'pointer', opacity: (!name || !phone || !city || !address) ? 0.5 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    التالي: طريقة الدفع <ChevronRight size={18} />
                                </button>
                            </>
                        )}

                        {step === 'payment' && (
                            <>
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>طريقة الدفع</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { key: 'cod', title: 'الدفع عند الاستلام', desc: 'ادفع نقداً عند استلام طلبك', icon: '💵' },
                                        { key: 'card', title: 'بطاقة ائتمانية', desc: 'Visa، Mastercard، JoPAY', icon: '💳' },
                                    ].map((p) => (
                                        <div
                                            key={p.key}
                                            onClick={() => setPayment(p.key as 'cod' | 'card')}
                                            style={{
                                                border: `2px solid ${payment === p.key ? primaryColor : '#E5E7EB'}`,
                                                borderRadius: 14, padding: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
                                                background: payment === p.key ? `${primaryColor}08` : 'white',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <div style={{ fontSize: 32 }}>{p.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.title}</div>
                                                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{p.desc}</div>
                                            </div>
                                            <div style={{ marginRight: 'auto', width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payment === p.key ? primaryColor : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {payment === p.key && <div style={{ width: 10, height: 10, borderRadius: '50%', background: primaryColor }} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                    <button onClick={() => setStep('address')} style={{ flex: 1, background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        رجوع
                                    </button>
                                    <button onClick={() => setStep('confirm')} style={{ flex: 2, background: primaryColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        مراجعة الطلب <ChevronRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 'confirm' && (
                            <>
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>مراجعة وتأكيد الطلب</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 10 }}>📍 بيانات التوصيل</div>
                                        <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 2 }}>
                                            <div>{name} — {phone}</div>
                                            <div>{city}، {address}</div>
                                            {notes && <div style={{ color: '#9CA3AF' }}>ملاحظة: {notes}</div>}
                                        </div>
                                    </div>
                                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 10 }}>💳 طريقة الدفع</div>
                                        <div style={{ fontSize: 14, color: '#4B5563' }}>{payment === 'cod' ? '💵 الدفع عند الاستلام' : '💳 بطاقة ائتمانية'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                    <button onClick={() => setStep('payment')} style={{ flex: 1, background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        رجوع
                                    </button>
                                    <button onClick={placeOrder} disabled={placing} style={{ flex: 2, background: '#10B981', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {placing ? 'جاري تأكيد الطلب...' : `✅ تأكيد الطلب — ${total.toFixed(2)} د.أ`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', padding: 20, height: 'fit-content' }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>ملخص الطلب</div>
                        {cartSummary.map((i) => (
                            <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{i.name}</div>
                                    <div style={{ color: '#9CA3AF', fontSize: 12 }}>{i.variant} × {i.qty}</div>
                                </div>
                                <div style={{ fontWeight: 700 }}>{(i.price * i.qty).toFixed(2)} د.أ</div>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                                <span>الشحن</span>
                                <span style={{ color: shipping === 0 ? '#10B981' : 'inherit', fontWeight: 600 }}>{shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} د.أ`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 17 }}>
                                <span>الإجمالي</span>
                                <span style={{ color: primaryColor }}>{total.toFixed(2)} د.أ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
