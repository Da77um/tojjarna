'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight, ChevronLeft, MapPin, CreditCard, Package, Phone, MessageCircle, Truck, Shield, Clock, Banknote } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

type Step = 'address' | 'payment' | 'confirm'

// Comprehensive Jordan cities with delivery zones
const CITIES = [
    { name: 'عمّان', nameEn: 'Amman', fee: 2.5, days: '1-2' },
    { name: 'الزرقاء', nameEn: 'Zarqa', fee: 3.0, days: '1-2' },
    { name: 'إربد', nameEn: 'Irbid', fee: 3.5, days: '2-3' },
    { name: 'العقبة', nameEn: 'Aqaba', fee: 5.0, days: '3-4' },
    { name: 'الكرك', nameEn: 'Karak', fee: 4.0, days: '2-3' },
    { name: 'السلط', nameEn: 'Salt', fee: 3.0, days: '1-2' },
    { name: 'مادبا', nameEn: 'Madaba', fee: 3.0, days: '1-2' },
    { name: 'جرش', nameEn: 'Jerash', fee: 3.5, days: '2-3' },
    { name: 'عجلون', nameEn: 'Ajloun', fee: 4.0, days: '2-3' },
    { name: 'المفرق', nameEn: 'Mafraq', fee: 4.0, days: '2-3' },
    { name: 'معان', nameEn: 'Maan', fee: 5.0, days: '3-4' },
    { name: 'الطفيلة', nameEn: 'Tafilah', fee: 4.5, days: '2-3' },
]

const cartSummary = [
    { name: 'قميص قطني أبيض', variant: 'L — أبيض', price: 25.0, qty: 2 },
    { name: 'عطر فرنسي', variant: '50ml', price: 55.0, qty: 1 },
]

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const unwrappedParams = use(params)
    const slug = unwrappedParams.slug
    const { t, lang, dir } = useLanguage()
    const [step, setStep] = useState<Step>('address')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [address, setAddress] = useState('')
    const [landmark, setLandmark] = useState('')
    const [notes, setNotes] = useState('')
    const [payment, setPayment] = useState<'cod' | 'card'>('cod')
    const [placing, setPlacing] = useState(false)
    const [placed, setPlaced] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const primaryColor = '#222222'
    const goldColor = '#C6A75E'
    const subtotal = cartSummary.reduce((s, i) => s + i.price * i.qty, 0)
    const selectedCity = CITIES.find(c => c.name === city)
    const shipping = subtotal >= 50 ? 0 : (selectedCity?.fee || 3.0)
    const deliveryDays = selectedCity?.days || '1-3'
    const total = subtotal + shipping

    const placeOrder = async () => {
        setPlacing(true)
        await new Promise((r) => setTimeout(r, 1600))
        setPlacing(false)
        setPlaced(true)
    }

    const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
        { key: 'address', label: t.storefront.addressStep, icon: MapPin },
        { key: 'payment', label: t.storefront.paymentStep, icon: CreditCard },
        { key: 'confirm', label: t.storefront.confirmStep, icon: Package },
    ]

    const currentStep = STEPS.findIndex((s) => s.key === step)

    // Order placed success screen
    if (placed) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, Inter, sans-serif', background: '#FAFAFA', padding: 20, direction: dir as 'rtl' | 'ltr' }}>
            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={48} color="#10B981" />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t.storefront.orderPlacedSuccess}</h1>
                <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                    {t.storefront.orderPlacedDesc.replace('{phone}', phone)}
                </p>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, margin: '24px 0', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>{t.storefront.orderDetails}</div>
                    {cartSummary.map((i) => (
                        <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                            <span>{i.name} ({i.qty}x)</span>
                            <span style={{ fontWeight: 600, direction: 'ltr' }}>{(i.price * i.qty).toFixed(2)} {t.common.currency}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16 }}>
                        <span>{t.storefront.total}</span>
                        <span style={{ color: primaryColor, direction: 'ltr' }}>{total.toFixed(2)} {t.common.currency}</span>
                    </div>
                </div>
                <Link href={`/store/${slug}`} style={{ display: 'block', background: primaryColor, color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                    {t.storefront.backToStore}
                </Link>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Tajawal, Inter, sans-serif', padding: '32px 20px', direction: dir as 'rtl' | 'ltr' }}>
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
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{t.storefront.deliveryInfo}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">{t.storefront.fullName}</label>
                                        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.storefront.fullNamePlaceholder} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t.storefront.phoneNumber}</label>
                                        <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.storefront.phoneNumberPlaceholder} dir="ltr" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t.storefront.city}</label>
                                        <select className="form-control" value={city} onChange={(e) => setCity(e.target.value)}>
                                            <option value="">{t.storefront.selectCity}</option>
                                            {CITIES.map((c) => (
                                                <option key={c.name} value={c.name}>
                                                    {lang === 'ar' ? c.name : c.nameEn} ({c.fee.toFixed(2)} {t.common.currency})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedCity && (
                                            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Truck size={12} /> {deliveryDays} {lang === 'ar' ? 'أيام' : 'days'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Banknote size={12} /> {shipping === 0 ? (lang === 'ar' ? 'توصيل مجاني' : 'Free delivery') : `${shipping.toFixed(2)} ${t.common.currency}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">{t.storefront.detailedAddress}</label>
                                        <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t.storefront.addressPlaceholder} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">{lang === 'ar' ? 'نقطة دالة / معلم قريب' : 'Landmark / Nearby Location'}</label>
                                        <input className="form-control" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder={lang === 'ar' ? 'مثال: قرب مسجد الحسين، بجانب مول عمّان' : 'e.g. Near Al-Hussein Mosque, next to Amman Mall'} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }} className="form-group">
                                        <label className="form-label">{t.storefront.notes} ({t.common.optional})</label>
                                        <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.storefront.notesPlaceholder} />
                                    </div>
                                </div>
                                <button
                                    disabled={!name || !phone || !city || !address}
                                    onClick={() => setStep('payment')}
                                    style={{ marginTop: 24, width: '100%', background: primaryColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: (!name || !phone || !city || !address) ? 'not-allowed' : 'pointer', opacity: (!name || !phone || !city || !address) ? 0.5 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    {t.storefront.nextPaymentMethod} {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                </button>
                            </>
                        )}

                        {step === 'payment' && (
                            <>
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{t.storefront.paymentMethod}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { key: 'cod', title: t.storefront.cod, desc: t.storefront.codDesc, icon: Banknote, recommended: true },
                                        { key: 'card', title: t.storefront.creditCard, desc: t.storefront.cardDesc, icon: CreditCard, recommended: false },
                                    ].map((p) => {
                                        const Icon = p.icon
                                        return (
                                            <div
                                                key={p.key}
                                                onClick={() => setPayment(p.key as 'cod' | 'card')}
                                                style={{
                                                    border: `2px solid ${payment === p.key ? goldColor : '#E5E7EB'}`,
                                                    borderRadius: 14, padding: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
                                                    background: payment === p.key ? `rgba(198,167,94,0.08)` : 'white',
                                                    transition: 'all 0.15s ease',
                                                    position: 'relative',
                                                }}
                                            >
                                                {p.recommended && (
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: -10, 
                                                        [dir === 'rtl' ? 'left' : 'right']: 12, 
                                                        background: goldColor, 
                                                        color: '#111', 
                                                        padding: '2px 10px', 
                                                        borderRadius: 100, 
                                                        fontSize: 11, 
                                                        fontWeight: 700 
                                                    }}>
                                                        {lang === 'ar' ? 'موصى به' : 'Recommended'}
                                                    </div>
                                                )}
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: payment === p.key ? goldColor : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icon size={22} color={payment === p.key ? '#111' : '#6B7280'} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{p.title}</div>
                                                    <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{p.desc}</div>
                                                </div>
                                                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${payment === p.key ? goldColor : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {payment === p.key && <div style={{ width: 12, height: 12, borderRadius: '50%', background: goldColor }} />}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                {/* Trust badges */}
                                <div style={{ display: 'flex', gap: 16, marginTop: 20, padding: 16, background: '#F9FAFB', borderRadius: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                                        <Shield size={14} color="#10B981" />
                                        {lang === 'ar' ? 'دفع آمن' : 'Secure Payment'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                                        <Truck size={14} color="#10B981" />
                                        {lang === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                                        <Phone size={14} color="#10B981" />
                                        {lang === 'ar' ? 'دعم متواصل' : '24/7 Support'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                    <button onClick={() => setStep('address')} style={{ flex: 1, background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {t.storefront.back}
                                    </button>
                                    <button onClick={() => setStep('confirm')} style={{ flex: 2, background: primaryColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {t.storefront.reviewOrderBtn} {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 'confirm' && (
                            <>
                                <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{t.storefront.reviewConfirmOrder}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <MapPin size={16} color={goldColor} /> {t.storefront.deliveryInfo}
                                        </div>
                                        <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 2 }}>
                                            <div style={{ fontWeight: 600 }}>{name}</div>
                                            <div style={{ direction: 'ltr', textAlign: dir === 'rtl' ? 'right' : 'left' }}>{phone}</div>
                                            <div>{city} — {address}</div>
                                            {landmark && <div style={{ color: '#6B7280' }}>{lang === 'ar' ? 'المعلم:' : 'Landmark:'} {landmark}</div>}
                                            {notes && <div style={{ color: '#9CA3AF', fontStyle: 'italic' }}>{notes}</div>}
                                        </div>
                                        <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 12, color: '#6B7280' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> {deliveryDays} {lang === 'ar' ? 'أيام عمل' : 'business days'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 10 }}>💳 {t.storefront.paymentMethod}</div>
                                        <div style={{ fontSize: 14, color: '#4B5563' }}>{payment === 'cod' ? `💵 ${t.storefront.cod}` : `💳 ${t.storefront.creditCard}`}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                    <button onClick={() => setStep('payment')} style={{ flex: 1, background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {t.storefront.back}
                                    </button>
                                    <button onClick={placeOrder} disabled={placing} style={{ flex: 2, background: '#10B981', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {placing ? t.storefront.placingOrder : t.storefront.confirmOrderBtn.replace('{total}', `${total.toFixed(2)} ${t.common.currency}`)}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', padding: 20, height: 'fit-content' }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t.storefront.orderSummary}</div>
                        {cartSummary.map((i) => (
                            <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{i.name}</div>
                                    <div style={{ color: '#9CA3AF', fontSize: 12 }}>{i.variant} × {i.qty}</div>
                                </div>
                                <div style={{ fontWeight: 700, direction: 'ltr' }}>{(i.price * i.qty).toFixed(2)} {t.common.currency}</div>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                                <span>{t.storefront.shipping}</span>
                                <span style={{ color: shipping === 0 ? '#10B981' : 'inherit', fontWeight: 600, direction: 'ltr' }}>{shipping === 0 ? t.storefront.free : `${shipping.toFixed(2)} ${t.common.currency}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 17 }}>
                                <span>{t.storefront.total}</span>
                                <span style={{ color: primaryColor, direction: 'ltr' }}>{total.toFixed(2)} {t.common.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
