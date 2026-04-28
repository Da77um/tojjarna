'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Store, CheckCircle, TrendingUp, Users, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const stats = [
  { icon: ShoppingBag, value: '+2,500', label: 'متجر نشط' },
  { icon: TrendingUp, value: '+50K', label: 'طلب شهرياً' },
  { icon: Users, value: '98%', label: 'رضا التجار' },
]

export default function LoginPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user?.id).single()
      router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={dir} style={{ minHeight: '100vh', display: 'flex', fontFamily: dir === 'rtl' ? 'Tajawal, sans-serif' : 'Inter, sans-serif' }}>

      {/* ── Left/Right: Brand Panel ── */}
      <div className="hide-on-mobile" style={{
        width: 480, flexShrink: 0,
        background: 'linear-gradient(145deg, #4A22B8 0%, #6C3CE1 55%, #8B5CF6 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 56, position: 'relative', overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 340 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color="#fff" />
            </div>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>تجارنا</span>
          </Link>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 14 }}>
            متجرك الاحترافي<br />في انتظارك
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, marginBottom: 40 }}>
            سجّل دخولك وتحكّم في مبيعاتك وطلباتك وعملاءك من مكان واحد.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="#F97316" />
                  </div>
                  <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', direction: 'ltr' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#F7F8FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <Link href="/" className="show-on-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#6C3CE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={16} color="#fff" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>تجارنا</span>
            </Link>
            <LanguageSwitcher compact />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {t.auth.welcomeBack}
          </h1>
          <p style={{ color: '#6B7280', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            {t.auth.loginDesc}
          </p>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 14px', color: '#991B1B', fontSize: 14, marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">{t.auth.email}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  required
                  style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>{t.auth.password}</label>
                <Link href="/forgot-password" style={{ color: '#6C3CE1', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  required
                  style={{ paddingRight: 40, paddingLeft: 40 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'left' : 'right']: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
              {loading ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 20, height: 20 }} /> : t.auth.loginBtn}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#6B7280', fontSize: 14 }}>
            {t.auth.noAccount}{' '}
            <Link href="/register" style={{ color: '#6C3CE1', fontWeight: 700, textDecoration: 'none' }}>
              {t.auth.createFreeAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
