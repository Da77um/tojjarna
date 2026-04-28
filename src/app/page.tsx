'use client'

import Link from 'next/link'
import {
  Store, ShoppingBag, BarChart3, Globe, Shield, Star,
  Package, Users, TrendingUp, Smartphone, CreditCard,
  MessageCircle, Menu, X, CheckCircle, ArrowLeft, ArrowRight,
  Sparkles, Zap, ChevronRight, Play, Check, LayoutDashboard,
  Palette, ShoppingCart, Truck, Bell, LifeBuoy,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/i18n/LanguageContext'

const features = [
  {
    icon: LayoutDashboard,
    color: '#6C3CE1',
    bg: '#EDE9FB',
    title: 'لوحة تحكم ذكية',
    description: 'أدر مبيعاتك وطلباتك وعملاءك من مكان واحد بتصميم بسيط وسهل الاستخدام',
  },
  {
    icon: Palette,
    color: '#F97316',
    bg: '#FEF0E6',
    title: 'تصميم متجرك بنفسك',
    description: 'محرر مرئي احترافي يتيح لك تخصيص ألوان وخطوط وأقسام متجرك دون أي كود',
  },
  {
    icon: CreditCard,
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'دفع بكل الطرق',
    description: 'الدفع عند الاستلام، بطاقات ائتمانية، Apple Pay، Google Pay ودفع آمن',
  },
  {
    icon: BarChart3,
    color: '#2563EB',
    bg: '#DBEAFE',
    title: 'تحليلات في الوقت الفعلي',
    description: 'تابع أرباحك وأفضل منتجاتك وسلوك عملاءك بتقارير يومية وأسبوعية',
  },
  {
    icon: MessageCircle,
    color: '#059669',
    bg: '#D1FAE5',
    title: 'إشعارات واتساب وSMS',
    description: 'أرسل تأكيدات الطلبات وتنبيهات التوصيل لعملائك تلقائياً',
  },
  {
    icon: Globe,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: 'نطاق خاص بك',
    description: 'احصل على رابط متجر فريد وأضف نطاقك الخاص لتعزيز علامتك التجارية',
  },
]

const steps = [
  { num: '01', title: 'سجّل مجاناً', desc: 'أنشئ حسابك في ثوانٍ بدون بطاقة ائتمان' },
  { num: '02', title: 'أضف منتجاتك', desc: 'ارفع صورك وأسعارك وابدأ تنظيم كتالوجك' },
  { num: '03', title: 'خصّص متجرك', desc: 'اختر ألوانك وخطوطك وصمّم صفحتك الرئيسية' },
  { num: '04', title: 'ابدأ البيع!', desc: 'شارك رابط متجرك واستقبل طلباتك فوراً' },
]

const testimonials = [
  {
    name: 'سارة الزعبي',
    role: 'صاحبة متجر ملابس يدوية',
    city: 'عمان',
    stars: 5,
    text: 'تجارنا غيّرت حياتي! في أسبوع واحد أصبح لدي متجر احترافي وبدأت أستقبل طلبات يومية. الدعم الفني ممتاز والمنصة سهلة جداً.',
    avatar: 'س',
    color: '#6C3CE1',
  },
  {
    name: 'محمد حداد',
    role: 'تاجر إلكترونيات',
    city: 'إربد',
    stars: 5,
    text: 'أفضل قرار أخذته لمتجري. التحليلات ساعدتني أفهم عملائي وأزيد مبيعاتي 40% خلال شهرين. أنصح كل تاجر بتجربتها.',
    avatar: 'م',
    color: '#F97316',
  },
  {
    name: 'نور المصري',
    role: 'صاحبة متجر عطور',
    city: 'الزرقاء',
    stars: 5,
    text: 'بدأت من الصفر وبدون أي خبرة تقنية. تجارنا أعطتني كل شيء احتاجه: متجر جميل، دفع آمن، وإشعارات واتساب للعملاء.',
    avatar: 'ن',
    color: '#16A34A',
  },
]

const plans = [
  {
    name: 'المجاني',
    price: 0,
    period: 'شهرياً',
    description: 'ابدأ وجرب المنصة',
    features: [
      'حتى 10 منتجات',
      'طلبات غير محدودة',
      'لوحة تحكم أساسية',
      'دفع عند الاستلام',
      'رابط متجر مجاني',
    ],
    highlighted: false,
    cta: 'ابدأ مجاناً',
    color: '#6B7280',
  },
  {
    name: 'الأساسي',
    price: 15,
    period: 'شهرياً',
    description: 'للمتاجر الصغيرة والمنزلية',
    features: [
      'حتى 100 منتج',
      'تحليلات المبيعات',
      'كوبونات الخصم',
      'إشعارات واتساب',
      'دفع بالبطاقة الائتمانية',
      'دعم فني مباشر',
    ],
    highlighted: false,
    cta: 'اشترك الآن',
    color: '#6C3CE1',
  },
  {
    name: 'الاحترافي',
    price: 35,
    period: 'شهرياً',
    description: 'للمتاجر المتنامية والمحترفة',
    features: [
      'منتجات غير محدودة',
      'تحليلات متقدمة',
      'نطاق خاص مجاني',
      'Apple Pay & Google Pay',
      'محرر ثيمات متقدم',
      'تعدد الفروع',
      'أولوية في الدعم الفني',
    ],
    highlighted: true,
    cta: 'ابدأ التجربة',
    color: '#F97316',
    badge: 'الأكثر شعبية',
  },
]

export default function LandingPage() {
  const { t, dir } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [plansData, setPlansData] = useState(plans)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('sort_order')
        if (data && data.length) {
          setPlansData(prev => prev.map((p, i) => data[i] ? { ...p, price: data[i].price_jod ?? p.price } : p))
        }
      } catch { /* use static fallback */ }
    }
    fetchPlans()
  }, [])

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight
  const ChevronDir = dir === 'rtl' ? ChevronRight : ChevronRight

  return (
    <div dir={dir} style={{ fontFamily: dir === 'rtl' ? 'Tajawal, sans-serif' : 'Inter, sans-serif', background: '#F7F8FA' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #E5E7EB' : '1px solid transparent',
        transition: 'all 0.25s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6C3CE1, #9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,60,225,0.3)' }}>
              <Store size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>تجارنا</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['الميزات', '#features'], ['الأسعار', '#pricing'], ['الشهادات', '#testimonials']].map(([label, href]) => (
              <a key={href} href={href} style={{ color: '#374151', fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6C3CE1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#374151')}>
                {label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher compact />
            <Link href="/login" className="hide-on-mobile" style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14, color: '#374151', border: '1.5px solid #E5E7EB', background: 'transparent', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#6C3CE1'; (e.currentTarget as HTMLAnchorElement).style.color = '#6C3CE1' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151' }}>
              تسجيل الدخول
            </Link>
            <Link href="/register" style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, color: '#fff', background: '#6C3CE1', textDecoration: 'none', boxShadow: '0 4px 12px rgba(108,60,225,0.25)', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#5A2FCC'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#6C3CE1'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none' }}>
              ابدأ مجاناً
            </Link>
            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="show-on-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#374151' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['الميزات', '#features'], ['الأسعار', '#pricing'], ['الشهادات', '#testimonials']].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: '#374151', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid #F1F2F6' }}>{label}</a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 8, border: '1.5px solid #E5E7EB', color: '#374151', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>دخول</Link>
              <Link href="/register" style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 8, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>ابدأ مجاناً</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #4A22B8 0%, #6C3CE1 45%, #8B5CF6 100%)', paddingTop: 64 }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: 'auto', gap: 48, alignItems: 'center', position: 'relative' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
              <Sparkles size={14} color="#F97316" />
              <span style={{ color: '#FDBA74', fontSize: 13, fontWeight: 700 }}>منصة التجارة الإلكترونية #1 في الأردن</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 24 }}>
              أطلق متجرك الاحترافي{' '}
              <span style={{ color: '#F97316' }}>في دقائق</span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              منصة تجارنا تمنحك كل ما تحتاجه لبيع منتجاتك أونلاين — من المتجر الاحترافي إلى المدفوعات والتوصيل وتحليلات المبيعات.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10, background: '#F97316', color: '#fff',
                fontWeight: 800, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 32px rgba(249,115,22,0.45)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(249,115,22,0.35)' }}>
                <Zap size={18} />
                ابدأ مجاناً الآن
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: '#fff',
                fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)' }}>
                تسجيل الدخول
              </Link>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              {[
                { value: '+2,500', label: 'متجر نشط' },
                { value: '+50K', label: 'طلب شهرياً' },
                { value: '98%', label: 'رضا التجار' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#F97316', direction: 'ltr' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 24px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EDE9FB', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Sparkles size={13} color="#6C3CE1" />
              <span style={{ color: '#6C3CE1', fontSize: 13, fontWeight: 700 }}>الميزات</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              كل ما تحتاجه في مكان واحد
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>
              تجارنا مبنية خصيصاً للسوق الأردني مع دعم كامل للعربية والريال والتوصيل المحلي
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card hover-lift" style={{ padding: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF0E6', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Zap size={13} color="#F97316" />
              <span style={{ color: '#F97316', fontSize: 13, fontWeight: 700 }}>كيف تبدأ؟</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              أربع خطوات وتبدأ البيع
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center', padding: '32px 24px', background: '#F7F8FA', borderRadius: 16, border: '1px solid #E5E7EB', position: 'relative' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#6C3CE1', letterSpacing: '0.1em', marginBottom: 12, direction: 'ltr' }}>{s.num}</div>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: i === 0 ? '#6C3CE1' : i === 3 ? '#F97316' : '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: i === 0 || i === 3 ? '#fff' : '#6C3CE1', fontSize: 22, fontWeight: 900 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '96px 24px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EDE9FB', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Star size={13} color="#6C3CE1" />
              <span style={{ color: '#6C3CE1', fontSize: 13, fontWeight: 700 }}>الأسعار</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              باقات تناسب كل متجر
            </h2>
            <p style={{ fontSize: 17, color: '#6B7280' }}>بدون رسوم خفية، يمكنك الترقية أو التخفيض في أي وقت</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {plansData.map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlighted ? 'linear-gradient(135deg, #6C3CE1, #8B5CF6)' : '#fff',
                border: plan.highlighted ? 'none' : '1px solid #E5E7EB',
                borderRadius: 20,
                padding: '32px 28px',
                position: 'relative',
                boxShadow: plan.highlighted ? '0 20px 56px rgba(108,60,225,0.25)' : '0 1px 3px rgba(15,23,42,0.06)',
                transform: plan.highlighted ? 'scale(1.03)' : 'none',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, insetInlineStart: '50%', transform: 'translateX(-50%)', background: '#F97316', color: '#fff', padding: '4px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: plan.highlighted ? 'rgba(255,255,255,0.85)' : '#6B7280' }}>{plan.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: plan.highlighted ? '#fff' : '#0F172A', direction: 'ltr' }}>{plan.price}</span>
                  <span style={{ fontSize: 16, color: plan.highlighted ? 'rgba(255,255,255,0.7)' : '#6B7280', fontWeight: 600 }}>د.أ / {plan.period}</span>
                </div>
                <p style={{ fontSize: 14, color: plan.highlighted ? 'rgba(255,255,255,0.75)' : '#6B7280', marginBottom: 28 }}>{plan.description}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.highlighted ? 'rgba(255,255,255,0.92)' : '#374151' }}>
                      <Check size={16} color={plan.highlighted ? '#F97316' : '#16A34A'} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/register" style={{
                  display: 'block', textAlign: 'center', padding: '12px 24px', borderRadius: 10,
                  fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  background: plan.highlighted ? '#F97316' : '#6C3CE1',
                  color: '#fff',
                  boxShadow: plan.highlighted ? '0 6px 20px rgba(249,115,22,0.35)' : '0 4px 12px rgba(108,60,225,0.2)',
                  transition: 'all 0.15s',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF0E6', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Star size={13} color="#F97316" />
              <span style={{ color: '#F97316', fontSize: 13, fontWeight: 700 }}>آراء التجار</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              يثق بنا آلاف التجار الأردنيين
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {testimonials.map((t) => (
              <div key={t.name} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={15} color="#F97316" fill="#F97316" />)}
                </div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid #F1F2F6' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{t.role} • {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #4A22B8, #6C3CE1, #8B5CF6)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            جاهز تبدأ متجرك؟
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 40 }}>
            انضم لأكثر من 2,500 تاجر أردني يبيعون أونلاين مع تجارنا. التسجيل مجاني تماماً.
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 40px', borderRadius: 12, background: '#F97316', color: '#fff',
            fontWeight: 800, fontSize: 17, textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(249,115,22,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 36px rgba(249,115,22,0.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 28px rgba(249,115,22,0.4)' }}>
            <Zap size={20} />
            أنشئ متجرك مجاناً الآن
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A', color: '#9CA3AF', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 56 }}>
            {/* Brand */}
            <div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6C3CE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={18} color="#fff" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>تجارنا</span>
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#6B7280', maxWidth: 220 }}>
                منصة التجارة الإلكترونية المخصصة للتجار الأردنيين والشركات الناشئة.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'المنصة', links: [['الميزات', '#features'], ['الأسعار', '#pricing'], ['الشهادات', '#testimonials']] },
              { title: 'الحساب', links: [['تسجيل الدخول', '/login'], ['إنشاء حساب', '/register'], ['نسيت كلمة المرور', '/forgot-password']] },
              { title: 'القانونية', links: [['سياسة الخصوصية', '#'], ['شروط الاستخدام', '#'], ['تواصل معنا', '#']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} style={{ color: '#6B7280', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#4B5563' }}>© 2024 تجارنا. جميع الحقوق محفوظة.</p>
            <p style={{ fontSize: 13, color: '#4B5563' }}>صُنع بـ ❤️ للتجار الأردنيين</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
