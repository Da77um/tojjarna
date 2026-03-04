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
  Zap,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const features = [
  {
    icon: Store,
    title: 'متجر احترافي في دقائق',
    description: 'أنشئ متجرك بسهولة دون أي خبرة تقنية، مع قوالب عصرية وتخصيص كامل للألوان والشعار',
    color: '#6C3CE1',
    bg: '#EDE9FE',
  },
  {
    icon: CreditCard,
    title: 'مدفوعات آمنة متعددة',
    description: 'استقبل الدفع عند الاستلام، البطاقات الائتمانية، Apple Pay وGoogle Pay بأمان تام',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    icon: BarChart3,
    title: 'تحليلات ذكية',
    description: 'تابع مبيعاتك وأرباحك وأفضل منتجاتك من لوحة تحكم واحدة سهلة الاستخدام',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    icon: Smartphone,
    title: 'تصميم عربي متوافق',
    description: 'كل صفحاتك محسّنة للجوال بالكامل مع دعم كامل للغة العربية من اليمين لليسار',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    icon: MessageCircle,
    title: 'إشعارات واتساب وSMS',
    description: 'أرسل إشعارات الطلبات تلقائياً لعملائك عبر واتساب والرسائل القصيرة',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    icon: Globe,
    title: 'نطاق احترافي',
    description: 'احصل على رابط متجر فريد وأضف نطاقك الخاص لتعزيز هوية علامتك التجارية',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
]

const plans = [
  {
    name: 'المجاني',
    nameEn: 'Free',
    price: 0,
    period: 'شهرياً',
    description: 'ابدأ مجاناً وجرّب المنصة',
    features: [
      'حتى 10 منتجات',
      'طلبات غير محدودة',
      'لوحة تحكم أساسية',
      'دعم الدفع عند الاستلام',
      'رابط متجر فرعي',
    ],
    highlighted: false,
    cta: 'ابدأ مجاناً',
  },
  {
    name: 'الأساسي',
    nameEn: 'Basic',
    price: 15,
    period: 'شهرياً',
    description: 'مثالي للمتاجر الصغيرة والمنزلية',
    features: [
      'حتى 100 منتج',
      'طلبات غير محدودة',
      'تحليلات المبيعات',
      'كوبونات الخصم',
      'إشعارات واتساب',
      'دعم البطاقات الائتمانية',
      'دعم فني عبر الدردشة',
    ],
    highlighted: false,
    cta: 'ابدأ الآن',
  },
  {
    name: 'الاحترافي',
    nameEn: 'Pro',
    price: 35,
    period: 'شهرياً',
    description: 'للمتاجر النامية والمتوسطة',
    features: [
      'منتجات غير محدودة',
      'طلبات غير محدودة',
      'تحليلات متقدمة',
      'نطاق مخصص مجاني',
      'ذكاء اصطناعي لكتابة الأوصاف',
      'تكامل مع شركات الشحن',
      'أولوية في الدعم الفني',
      'Apple Pay & Google Pay',
    ],
    highlighted: true,
    cta: 'ابدأ التجربة',
  },
]

const testimonials = [
  {
    name: 'سارة الأحمد',
    role: 'صاحبة متجر ملابس عبايات',
    avatar: 'س',
    rating: 5,
    text: 'باسكت غيّرت حياتي! كنت أبيع من الإنستقرام فقط، الآن عندي متجر احترافي وطلباتي تضاعفت خلال شهرين.',
    color: '#6C3CE1',
  },
  {
    name: 'محمد الزعبي',
    role: 'صاحب متجر إلكترونيات',
    avatar: 'م',
    rating: 5,
    text: 'سهولة الاستخدام لا مثيل لها. أضفت 200 منتج وبدأت أستقبل طلبات في نفس اليوم.',
    color: '#10B981',
  },
  {
    name: 'رنا حداد',
    role: 'صانعة حلويات منزلية',
    avatar: 'ر',
    rating: 5,
    text: 'الدعم الفني رائع والمحادثات مع العملاء عبر واتساب سهّلت عملي كثيراً. أنصح به كل من يريد البيع أونلاين.',
    color: '#F59E0B',
  },
]

const stats = [
  { label: 'متجر نشط', value: '2,500+', icon: Store },
  { label: 'طلب شهرياً', value: '50,000+', icon: ShoppingBag },
  { label: 'تاجر راضٍ', value: '98%', icon: Star },
  { label: 'دولة مدعومة', value: '1', icon: Globe },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePlans, setActivePlans] = useState(plans)

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
          description: p.name_en?.toLowerCase() === 'pro' || p.price_jod > 20 ? 'للمتاجر النامية والمتوسطة' : (p.price_jod > 0 ? 'مثالي للمتاجر الصغيرة والمنزلية' : 'ابدأ مجاناً وجرّب المنصة'),
          features: p.features || [],
          highlighted: p.name_en?.toLowerCase() === 'pro' || p.price_jod >= 30, // highlight premium
          cta: p.price_jod > 0 ? 'ابدأ الآن' : 'ابدأ مجاناً',
        })))
      }
    }
    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* ===== NAVBAR ===== */}
      <nav
        style={{
          background: 'rgba(15,15,23,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(108,60,225,0.4)',
              }}
            >
              <Store size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              باسكت
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">المميزات</a>
            <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">الأسعار</a>
            <a href="#testimonials" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">آراء العملاء</a>
          </div>

          {/* Desktop CTA buttons */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/login"
              style={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
              }}
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ fontSize: 14 }}
            >
              ابدأ مجاناً
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="show-on-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="show-on-mobile"
            style={{
              position: 'absolute',
              top: 68,
              left: 0,
              right: 0,
              background: 'rgba(15,15,23,0.98)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexDirection: 'column',
              padding: '24px',
              gap: 20,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>المميزات</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>الأسعار</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>آراء العملاء</a>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            <Link href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>تسجيل الدخول</Link>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }}>ابدأ مجاناً</Link>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section
        className="hero-bg"
        style={{ padding: '100px 24px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(108,60,225,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(108,60,225,0.15)',
              border: '1px solid rgba(108,60,225,0.3)',
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 28,
            }}
          >
            <Zap size={14} color="#8B5CF6" />
            <span style={{ color: '#8B5CF6', fontSize: 13, fontWeight: 600 }}>
              المنصة الأردنية الأولى للتجارة الإلكترونية
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
              color: 'white',
              letterSpacing: '-1px',
            }}
          >
            ابدأ{' '}
            <span className="gradient-text">متجرك الإلكتروني</span>
            <br />
            في دقائق
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 4vw, 18px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 560,
              margin: '0 auto 40px',
              padding: '0 10px',
            }}
          >
            أنشئ متجرك الإلكتروني، بيع منتجاتك، واستقبل الدفعات بسهولة. بدون خبرة تقنية، بدون تعقيدات.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/register"
              className="btn btn-primary btn-lg"
              style={{ fontSize: 16, gap: 10 }}
            >
              ابدأ مجاناً الآن
              <ArrowLeft size={18} />
            </Link>
            <Link
              href="/store/demo"
              className="btn btn-lg glass"
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontSize: 16 }}
            >
              شاهد مثال على المتجر
            </Link>
          </div>

          <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            لا حاجة لبطاقة ائتمانية • خطة مجانية دائمة
          </p>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 24,
          }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon size={22} color="white" />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span
              style={{
                background: '#EDE9FE',
                color: '#6C3CE1',
                padding: '4px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              المميزات
            </span>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>
              كل ما تحتاجه لنجاح متجرك
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              أدوات احترافية مصممة خصيصاً للسوق الأردني
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card card-body" style={{ transition: 'all 0.3s ease' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: f.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <Icon size={24} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span
            style={{
              background: '#D1FAE5',
              color: '#065F46',
              padding: '4px 16px',
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            كيف تبدأ؟
          </span>
          <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>3 خطوات فقط</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginBottom: 60 }}>
            أسهل طريقة لإطلاق متجرك الإلكتروني
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 32,
            }}
          >
            {[
              {
                step: '01',
                title: 'سجّل حسابك',
                desc: 'أنشئ حسابك مجاناً في أقل من دقيقة',
                icon: Users,
              },
              {
                step: '02',
                title: 'أنشئ متجرك',
                desc: 'اختر اسم المتجر وأضف منتجاتك بسهولة',
                icon: Package,
              },
              {
                step: '03',
                title: 'ابدأ البيع',
                desc: 'شارك رابط متجرك وابدأ باستقبال الطلبات فوراً',
                icon: TrendingUp,
              },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 8px 24px rgba(108,60,225,0.3)',
                    }}
                  >
                    <Icon size={28} color="white" />
                  </div>
                  <div
                    style={{
                      background: '#EDE9FE',
                      color: '#6C3CE1',
                      fontSize: 12,
                      fontWeight: 800,
                      borderRadius: 100,
                      padding: '2px 10px',
                      display: 'inline-block',
                      marginBottom: 12,
                    }}
                  >
                    {step.step}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                padding: '4px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              الأسعار
            </span>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>
              أسعار مناسبة لجميع الأحجام
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              ابدأ مجاناً وطوّر خطتك مع نمو متجرك
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            {activePlans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #6C3CE1, #8B5CF6)'
                    : 'var(--surface)',
                  border: plan.highlighted ? 'none' : '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 32,
                  position: 'relative',
                  boxShadow: plan.highlighted
                    ? '0 20px 60px rgba(108,60,225,0.35)'
                    : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#F59E0B',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '4px 18px',
                      borderRadius: 100,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ⭐ الأكثر شعبية
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: plan.highlighted ? 'white' : 'var(--text-primary)',
                      marginBottom: 8,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                    }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: plan.highlighted ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {plan.price === 0 ? 'مجاني' : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span
                      style={{
                        fontSize: 14,
                        color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                        marginRight: 6,
                      }}
                    >
                      د.أ / {plan.period}
                    </span>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, flex: 1 }}>
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 0',
                        fontSize: 14,
                        color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
                        borderBottom: `1px solid ${plan.highlighted ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
                      }}
                    >
                      <CheckCircle
                        size={16}
                        color={plan.highlighted ? '#A5F3FC' : '#10B981'}
                        style={{ flexShrink: 0 }}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '13px 24px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    background: plan.highlighted ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                    color: 'white',
                    border: plan.highlighted ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                    transition: 'all 0.2s ease',
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
      <section
        id="testimonials"
        style={{ padding: '80px 24px', background: 'var(--surface)' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span
              style={{
                background: '#EDE9FE',
                color: '#6C3CE1',
                padding: '4px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              آراء عملائنا
            </span>
            <h2 style={{ fontSize: 40, fontWeight: 900 }}>
              ماذا يقول تجارنا عنّا
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {testimonials.map((t) => (
              <div key={t.name} className="card card-body">
                <div style={{ marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" style={{ display: 'inline' }} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
            borderRadius: 28,
            padding: '64px 48px',
            boxShadow: '0 24px 80px rgba(108,60,225,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
            }}
          />
          <Shield size={40} color="rgba(255,255,255,0.3)" style={{ marginBottom: 24 }} />
          <h2
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: 'white',
              marginBottom: 16,
              position: 'relative',
            }}
          >
            ابدأ متجرك اليوم مجاناً
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 17,
              marginBottom: 36,
              lineHeight: 1.7,
              position: 'relative',
            }}
          >
            انضم إلى أكثر من 2500 تاجر أردني يبيعون بنجاح على باسكت
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'white',
              color: '#6C3CE1',
              padding: '14px 32px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            أنشئ متجرك الآن
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          background: '#0F0F17',
          color: 'rgba(255,255,255,0.5)',
          padding: '48px 24px 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Store size={18} color="white" />
                </div>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>باسكت</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8 }}>
                منصة التجارة الإلكترونية الأردنية الأولى. نساعدك على إطلاق متجرك وتحقيق النجاح.
              </p>
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 16 }}>المنصة</h4>
              {['المميزات', 'الأسعار', 'قوالب المتاجر', 'التكاملات'].map((item) => (
                <div key={item} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
                    {item}
                  </a>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: 'white', fontWeight: 700, marginBottom: 16 }}>الدعم</h4>
              {['مركز المساعدة', 'تواصل معنا', 'سياسة الخصوصية', 'الشروط والأحكام'].map((item) => (
                <div key={item} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13 }}>
              © 2025 باسكت. جميع الحقوق محفوظة.
            </span>
            <span style={{ fontSize: 13 }}>صُنع بـ ❤️ في الأردن</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
