'use client'

import Link from 'next/link'
import {
  Store,
  ShoppingBag,
  BarChart3,
  Globe,
  Shield,
  Star,
  Package,
  Users,
  TrendingUp,
  Smartphone,
  CreditCard,
  MessageCircle,
  Menu,
  X,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const features = [
  {
    icon: Store,
    title: 'متجر احترافي في دقائق',
    description: 'أنشئ متجرك بسهولة دون أي خبرة تقنية، مع قوالب عصرية وتخصيص كامل',
  },
  {
    icon: CreditCard,
    title: 'مدفوعات آمنة متعددة',
    description: 'استقبل الدفع عند الاستلام، البطاقات الائتمانية، Apple Pay وGoogle Pay',
  },
  {
    icon: BarChart3,
    title: 'تحليلات ذكية',
    description: 'تابع مبيعاتك وأرباحك وأفضل منتجاتك من لوحة تحكم واحدة',
  },
  {
    icon: Smartphone,
    title: 'تصميم عربي متوافق',
    description: 'كل صفحاتك محسّنة للجوال بالكامل مع دعم كامل للغة العربية',
  },
  {
    icon: MessageCircle,
    title: 'إشعارات واتساب وSMS',
    description: 'أرسل إشعارات الطلبات تلقائياً لعملائك عبر واتساب والرسائل القصيرة',
  },
  {
    icon: Globe,
    title: 'نطاق احترافي',
    description: 'احصل على رابط متجر فريد وأضف نطاقك الخاص لتعزيز هويتك التجارية',
  },
]

const plans = [
  {
    name: 'المجاني',
    nameEn: 'Free',
    price: 0,
    period: 'شهرياً',
    description: 'ابدأ مجاناً وجرّب المنصة',
    features: ['حتى 10 منتجات', 'طلبات غير محدودة', 'لوحة تحكم أساسية', 'دعم الدفع عند الاستلام'],
    highlighted: false,
    cta: 'ابدأ مجاناً',
  },
  {
    name: 'الأساسي',
    nameEn: 'Basic',
    price: 15,
    period: 'شهرياً',
    description: 'مثالي للمتاجر الصغيرة والمنزلية',
    features: ['حتى 100 منتج', 'تحليلات المبيعات', 'كوبونات الخصم', 'إشعارات واتساب', 'دعم البطاقات الائتمانية'],
    highlighted: false,
    cta: 'ابدأ الآن',
  },
  {
    name: 'الاحترافي',
    nameEn: 'Pro',
    price: 35,
    period: 'شهرياً',
    description: 'للمتاجر النامية والطموحة',
    features: ['منتجات غير محدودة', 'تحليلات متقدمة', 'نطاق مخصص مجاني', 'ذكاء اصطناعي للأوصاف', 'Apple Pay & Google Pay', 'أولوية في الدعم الفني'],
    highlighted: true,
    cta: 'ابدأ التجربة',
  },
]

const testimonials = [
  {
    name: 'سارة الأحمد',
    role: 'صاحبة متجر عبايات — عمّان',
    avatar: 'س',
    rating: 5,
    text: 'تجربتي مع المنصة غيّرت مسار عملي. طلباتي تضاعفت خلال شهرين وأصبح لدي متجر بمستوى احترافي حقيقي.',
  },
  {
    name: 'محمد الزعبي',
    role: 'تاجر إلكترونيات — الزرقاء',
    avatar: 'م',
    rating: 5,
    text: 'سهولة الاستخدام لا مثيل لها. أضفت 200 منتج وبدأت أستقبل طلبات في نفس اليوم من الإطلاق.',
  },
  {
    name: 'رنا حداد',
    role: 'صانعة حلويات — اربد',
    avatar: 'ر',
    rating: 5,
    text: 'الدعم الفني رائع والتواصل مع العملاء عبر واتساب سهّل عملي بشكل لم أتوقعه.',
  },
]

const stats = [
  { label: 'متجر نشط', value: '2,500+', icon: Store },
  { label: 'طلب شهرياً', value: '50,000+', icon: ShoppingBag },
  { label: 'نسبة الرضا', value: '98%', icon: Star },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePlans, setActivePlans] = useState(plans)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchPlans() {
      const supabase = createClient()
      const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      if (data && data.length > 0) {
        setActivePlans(data.map(p => ({
          name: p.name_ar,
          nameEn: p.name_en,
          price: p.price_jod,
          period: 'شهرياً',
          description: p.name_en?.toLowerCase() === 'pro' || p.price_jod > 20 ? 'للمتاجر النامية والطموحة' : (p.price_jod > 0 ? 'مثالي للمتاجر الصغيرة والمنزلية' : 'ابدأ مجاناً وجرّب المنصة'),
          features: p.features || [],
          highlighted: p.name_en?.toLowerCase() === 'pro' || p.price_jod >= 30,
          cta: p.price_jod > 0 ? 'ابدأ الآن' : 'ابدأ مجاناً',
        })))
      }
    }
    fetchPlans()
  }, [])

  return (
    <div dir="rtl" style={{ background: '#EFE8DD', minHeight: '100vh', fontFamily: 'Tajawal, sans-serif' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        background: scrolled ? 'rgba(239,232,221,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #E0D6C8' : '1px solid transparent',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.35s ease',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#222222',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34,34,34,0.25)',
            }}>
              <Store size={20} color="#C6A75E" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-0.5px' }}>تجارنا</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 36, color: '#6B6058', fontSize: 15, fontWeight: 600 }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>المميزات</a>
            <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>الأسعار</a>
            <a href="#testimonials" style={{ color: 'inherit', textDecoration: 'none' }}>آراء العملاء</a>
          </div>

          {/* CTA Buttons */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" id="login-btn" style={{
              padding: '9px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              color: '#111111', textDecoration: 'none', border: '1.5px solid #D0C8BC',
              background: 'transparent',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#222222'; (e.currentTarget as HTMLAnchorElement).style.color = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222222' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#111111'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#D0C8BC' }}
            >
              تسجيل الدخول
            </Link>
            <Link href="/register" id="register-btn" style={{
              padding: '9px 22px', borderRadius: 10, fontWeight: 800, fontSize: 14,
              background: '#C6A75E', color: '#111111', textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(198,167,94,0.3)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#A8883C'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C6A75E'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
            >
              انشئ متجرك مجاناً
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            className="show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111111', display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#EFE8DD', borderTop: '1px solid #E0D6C8', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a href="#features" style={{ color: '#111111', textDecoration: 'none', fontWeight: 700, fontSize: 16 }} onClick={() => setMobileMenuOpen(false)}>المميزات</a>
            <a href="#pricing" style={{ color: '#111111', textDecoration: 'none', fontWeight: 700, fontSize: 16 }} onClick={() => setMobileMenuOpen(false)}>الأسعار</a>
            <Link href="/login" style={{ color: '#111111', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>تسجيل الدخول</Link>
            <Link href="/register" id="mobile-reg-btn" style={{ background: '#C6A75E', color: '#111111', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, textAlign: 'center', fontSize: 16 }}>انشئ متجرك مجاناً</Link>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        background: 'linear-gradient(160deg, #1C1C1C 0%, #2A2A2A 60%, #1A1A1A 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px',
      }}>
        {/* Subtle background ornament */}
        <div style={{ position: 'absolute', top: '10%', left: '-80px', width: 400, height: 400, background: 'radial-gradient(circle, rgba(198,167,94,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-100px', width: 500, height: 500, background: 'radial-gradient(circle, rgba(198,167,94,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative' }}>

          {/* Eyebrow label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(198,167,94,0.12)', border: '1px solid rgba(198,167,94,0.3)',
            padding: '6px 18px', borderRadius: 50, marginBottom: 32,
          }}>
            <Sparkles size={14} color="#C6A75E" />
            <span style={{ color: '#C6A75E', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>أبرز منصة تجارة إلكترونية في الأردن</span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: '#FFFFFF',
            lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            أطلق متجرك الإلكتروني
            <br />
            <span style={{ color: '#C6A75E' }}>بمستوى عالمي</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'rgba(255,255,255,0.6)',
            maxWidth: 600, margin: '0 auto 44px', lineHeight: 1.75,
          }}>
            منصة تجارنا تمنحك كل أدوات البيع الاحترافية — من متجر جاهز، إلى مدفوعات آمنة، وتحليلات دقيقة. كل ذلك بنقرة واحدة.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/register" id="hero-cta-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#C6A75E', color: '#111111',
              padding: '16px 40px', borderRadius: 12,
              fontWeight: 900, fontSize: 17, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(198,167,94,0.35)',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B8963A'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C6A75E'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
            >
              ابدأ مجاناً الآن
              <ChevronLeft size={18} />
            </Link>
            <Link href="/login" id="hero-cta-secondary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              color: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '16px 36px', borderRadius: 12,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)' }}
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: '#C6A75E', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: '100px 24px', background: '#EFE8DD' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#C6A75E', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>مميزات المنصة</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111111', letterSpacing: '-0.02em', marginBottom: 16 }}>كل ما تحتاجه في منصة واحدة</h2>
            <div style={{ width: 48, height: 3, background: '#C6A75E', borderRadius: 2, margin: '0 auto' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card-luxury" style={{
                padding: 32, background: '#FFFFFF', borderRadius: 16,
                border: '1px solid #E0D6C8', transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 48px rgba(34,34,34,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(34,34,34,0.06)' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: '#EFE8DD', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <f.icon size={24} color="#C6A75E" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111111', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: '#6B6058', fontSize: 15, lineHeight: 1.7 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DARK HIGHLIGHT BANNER ===== */}
      <section style={{
        background: '#1C1C1C',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ color: '#C6A75E', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>جاهز للإطلاق؟</p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,50px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.02em' }}>
            أكثر من 2,500 تاجر أردني<br />يثقون في تجارنا
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
            انضم لأكبر مجتمع تجاري رقمي في الأردن واحكم قبضتك على عملك بأدوات متكاملة وفريق دعم متميز.
          </p>
          <Link href="/register" id="banner-cta" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#C6A75E', color: '#111111',
            padding: '15px 40px', borderRadius: 12,
            fontWeight: 900, fontSize: 16, textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(198,167,94,0.3)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B8963A'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C6A75E'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
          >
            ابدأ رحلتك التجارية الآن
            <ChevronLeft size={18} />
          </Link>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: '100px 24px', background: '#F5F0E8' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#C6A75E', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>الباقات والأسعار</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111111', letterSpacing: '-0.02em', marginBottom: 16 }}>شفافية كاملة في التسعير</h2>
            <div style={{ width: 48, height: 3, background: '#C6A75E', borderRadius: 2, margin: '0 auto' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
            {activePlans.map((plan, i) => (
              <div key={i} style={{
                background: plan.highlighted ? '#1C1C1C' : '#FFFFFF',
                borderRadius: 20,
                padding: 36,
                border: plan.highlighted ? '1px solid #C6A75E' : '1px solid #E0D6C8',
                boxShadow: plan.highlighted ? '0 20px 60px rgba(34,34,34,0.18)' : '0 4px 20px rgba(34,34,34,0.06)',
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -14, right: '50%', transform: 'translateX(50%)',
                    background: '#C6A75E', color: '#111111',
                    padding: '5px 18px', borderRadius: 50, fontSize: 12, fontWeight: 900,
                    letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>
                    ⭐ الأكثر شعبية
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: plan.highlighted ? '#FFFFFF' : '#111111', marginBottom: 6 }}>{plan.name}</h3>
                  <p style={{ color: plan.highlighted ? 'rgba(255,255,255,0.5)' : '#6B6058', fontSize: 14 }}>{plan.description}</p>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, color: plan.highlighted ? '#C6A75E' : '#111111', lineHeight: 1 }}>
                    {plan.price === 0 ? 'مجاني' : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: 15, color: plan.highlighted ? 'rgba(255,255,255,0.5)' : '#6B6058', marginRight: 6 }}>
                      د.أ / {plan.period}
                    </span>
                  )}
                </div>

                <div style={{ borderTop: plan.highlighted ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E8E0D5', paddingTop: 24, marginBottom: 28 }}>
                  {plan.features.map((feat, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                      <CheckCircle size={16} color="#C6A75E" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#4A4440', fontSize: 14, lineHeight: 1.5 }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register" id={`plan-cta-${i}`} style={{
                  display: 'block', textAlign: 'center',
                  background: plan.highlighted ? '#C6A75E' : 'transparent',
                  color: plan.highlighted ? '#111111' : '#111111',
                  border: plan.highlighted ? '2px solid #C6A75E' : '2px solid #222222',
                  padding: '13px 24px', borderRadius: 10,
                  fontWeight: 800, fontSize: 15, textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    if (plan.highlighted) { el.style.background = '#B8963A'; el.style.borderColor = '#B8963A' }
                    else { el.style.background = '#222222'; el.style.color = 'white' }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    if (plan.highlighted) { el.style.background = '#C6A75E'; el.style.borderColor = '#C6A75E' }
                    else { el.style.background = 'transparent'; el.style.color = '#111111' }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" style={{ padding: '100px 24px', background: '#EFE8DD' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#C6A75E', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>آراء تجارنا</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111111', letterSpacing: '-0.02em', marginBottom: 16 }}>ماذا يقول عملاؤنا؟</h2>
            <div style={{ width: 48, height: 3, background: '#C6A75E', borderRadius: 2, margin: '0 auto' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: '#FFFFFF', borderRadius: 16, padding: 32,
                border: '1px solid #E0D6C8',
                boxShadow: '0 4px 20px rgba(34,34,34,0.06)',
                transition: 'transform 0.3s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {[...Array(t.rating)].map((_, si) => <Star key={si} size={16} color="#C6A75E" fill="#C6A75E" />)}
                </div>

                <p style={{ color: '#4A4440', fontSize: 15, lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid #EDE5D8', paddingTop: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#C6A75E', fontWeight: 900, fontSize: 18, flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#111111', fontSize: 15 }}>{t.name}</div>
                    <div style={{ color: '#6B6058', fontSize: 13 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section style={{
        background: 'linear-gradient(160deg, #1C1C1C 0%, #2A2A2A 100%)',
        padding: '100px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 900, color: '#FFFFFF', marginBottom: 20, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            مستعد لتأسيس<br /><span style={{ color: '#C6A75E' }}>إمبراطوريتك التجارية؟</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 44, lineHeight: 1.7 }}>
            انضم اليوم وابدأ مجاناً. لا كرت بنكي. لا التزامات.
          </p>
          <Link href="/register" id="final-cta" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#C6A75E', color: '#111111',
            padding: '17px 48px', borderRadius: 12,
            fontWeight: 900, fontSize: 18, textDecoration: 'none',
            boxShadow: '0 10px 36px rgba(198,167,94,0.35)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#B8963A'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C6A75E'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
          >
            أنشئ متجرك مجاناً
            <ChevronLeft size={20} />
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111111', color: 'rgba(255,255,255,0.5)', padding: '60px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1C1C1C', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={18} color="#C6A75E" />
                </div>
                <span style={{ color: 'white', fontWeight: 900, fontSize: 20 }}>تجارنا</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75 }}>منصة التجارة الإلكترونية الرائدة للأردنيين. ابنِ متجرك، وابدأ تجارتك.</p>
            </div>

            {/* Links */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>المنصة</h4>
              {['المميزات', 'الأسعار', 'التحليلات', 'الدعم الفني'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C6A75E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
                  >{l}</a>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>الشركة</h4>
              {['من نحن', 'الشركاء', 'الوظائف', 'أخبارنا'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C6A75E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}
                  >{l}</a>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 16 }}>قانوني</h4>
              {['الشروط والأحكام', 'سياسة الخصوصية', 'سياسة الاسترجاع'].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>{l}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #222222', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13 }}>© 2025 تجارنا. جميع الحقوق محفوظة.</span>
            <span style={{ fontSize: 13, color: '#C6A75E' }}>صُنع بشغف في عمّان، الأردن 🇯🇴</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
