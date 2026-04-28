'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Phone, Store, Eye, EyeOff, Mail, Lock, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const benefits = [
  'أنشئ متجرك في أقل من 5 دقائق',
  'حتى 10 منتجات مجاناً للأبد',
  'بدون بطاقة ائتمانية',
  'دعم فني على مدار الساعة',
]

export default function RegisterPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch)
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError(t.auth.passwordLength)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name, phone: formData.phone } },
      })
      if (authError) throw authError

      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: 'vendor',
        })
        toast.success('تم إنشاء حسابك بنجاح!')
        router.push('/dashboard/setup')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.registerError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={dir} style={{ minHeight: '100vh', display: 'flex', fontFamily: dir === 'rtl' ? 'Tajawal, sans-serif' : 'Inter, sans-serif' }}>

      {/* ── Brand Panel ── */}
      <div className="hide-on-mobile" style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '56px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(108,60,225,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(108,60,225,0.4)' }}>
              <Store size={22} color="#fff" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>تجارنا</span>
          </Link>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 12 }}>
            انضم لآلاف التجار<br />الأردنيين الناجحين
          </h2>
          <p style={{ fontSize: 15, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 40 }}>
            ابدأ مجاناً اليوم وبيع منتجاتك لعملاء في كل مكان.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {benefits.map(b => (
              <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(108,60,225,0.2)', border: '1px solid rgba(108,60,225,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={13} color="#A78BFA" />
                </div>
                <span style={{ fontSize: 14, color: '#D1D5DB' }}>{b}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #1E293B' }}>
            <p style={{ fontSize: 13, color: '#4B5563' }}>لديك حساب بالفعل؟{' '}
              <Link href="/login" style={{ color: '#A78BFA', fontWeight: 700, textDecoration: 'none' }}>تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#F7F8FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <Link href="/" className="show-on-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6C3CE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={15} color="#fff" />
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#0F172A' }}>تجارنا</span>
            </Link>
            <LanguageSwitcher compact />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' }}>
            أنشئ حسابك مجاناً
          </h1>
          <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
            ابدأ تجربتك مع تجارنا — لا حاجة لبطاقة ائتمانية
          </p>

          <form onSubmit={handleRegister}>
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 14px', color: '#991B1B', fontSize: 14, marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Name */}
            <div className="form-group">
              <label className="form-label">{t.auth.fullName}</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder={t.auth.fullNamePlaceholder} required style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 38 }} />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">{t.auth.email}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} placeholder={t.auth.emailPlaceholder} required style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 38 }} />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">{t.auth.phone}</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} placeholder="07xxxxxxxx" style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 38 }} />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">{t.auth.password}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} style={{ paddingRight: 38, paddingLeft: 38 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'left' : 'right']: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">{t.auth.confirmPassword}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 38 }} />
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20, lineHeight: 1.6 }}>
              بإنشاء حسابك، أنت توافق على{' '}
              <Link href="#" style={{ color: '#6C3CE1', fontWeight: 600 }}>شروط الاستخدام</Link>{' '}و{' '}
              <Link href="#" style={{ color: '#6C3CE1', fontWeight: 600 }}>سياسة الخصوصية</Link>
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: loading ? '#9CA3AF' : '#6C3CE1', color: '#fff',
                border: 'none', padding: '13px 24px', borderRadius: 10,
                fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 14px rgba(108,60,225,0.25)',
                transition: 'all 0.2s',
              }}>
              {loading
                ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 20, height: 20 }} />
                : <><span>إنشاء الحساب</span><ArrowIcon size={16} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#6B7280', fontSize: 14 }}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" style={{ color: '#6C3CE1', fontWeight: 700, textDecoration: 'none' }}>
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
