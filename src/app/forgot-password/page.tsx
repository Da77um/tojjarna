'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Store, ArrowLeft, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

export default function ForgotPasswordPage() {
  const { t, dir } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.resetError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={dir} style={{
      minHeight: '100vh', background: '#F7F8FA',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: dir === 'rtl' ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,60,225,0.28)' }}>
              <Store size={22} color="#fff" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>تجارنا</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={36} color="#16A34A" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>{t.auth.resetLinkSent}</h2>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                {t.auth.checkEmailDesc}
              </p>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 10, background: '#6C3CE1',
                color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
              }}>
                <ArrowLeft size={16} />
                {t.auth.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {t.auth.resetPasswordTitle}
                </h1>
                <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.65 }}>
                  {t.auth.resetPasswordDesc}
                </p>
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 14px', color: '#991B1B', fontSize: 14, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleResetRequest}>
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

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: loading ? '#9CA3AF' : '#6C3CE1', color: '#fff',
                    border: 'none', padding: '12px 24px', borderRadius: 10,
                    fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', marginBottom: 20,
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(108,60,225,0.22)',
                    transition: 'all 0.2s',
                  }}>
                  {loading
                    ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 20, height: 20 }} />
                    : t.auth.sendResetLink}
                </button>

                <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#6B7280', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6C3CE1')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                  <ArrowLeft size={15} />
                  {t.auth.backToLogin}
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
