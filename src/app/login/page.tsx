'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

export default function LoginPage() {
    const router = useRouter()
    const { t, dir } = useLanguage()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(true)
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
            if (profile?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t.auth.loginError
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div dir={dir} className="mobile-stack" style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#EFE8DD',
            fontFamily: 'Tajawal, Inter, sans-serif',
        }}>
            {/* Left: Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '56px 24px',
            }}>
                <div className="mobile-full-width" style={{ width: '100%', maxWidth: 420 }}>

                    {/* Logo */}
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 10,
                            background: '#222222',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(34,34,34,0.2)',
                        }}>
                            <Store size={20} color="#C6A75E" />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#111111' }}>تجارنا</span>
                    </Link>

                    {/* Headline */}
                    <h1 style={{ fontSize: 30, fontWeight: 900, color: '#111111', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        {t.auth.welcomeBack}
                    </h1>
                    <p style={{ color: '#6B6058', marginBottom: 36, fontSize: 15, lineHeight: 1.6 }}>
                        {t.auth.loginDesc}
                    </p>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div style={{
                                background: 'rgba(192,57,43,0.08)',
                                border: '1px solid rgba(192,57,43,0.25)',
                                borderRadius: 10, padding: '12px 16px',
                                color: '#8B1A1A', fontSize: 14, marginBottom: 20,
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{t.auth.email}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={17} color="#A09080" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }} />
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t.auth.emailPlaceholder}
                                    required
                                    style={{ [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 44 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label className="form-label" style={{ margin: 0 }}>{t.auth.password}</label>
                                <Link href="/forgot-password" style={{ color: '#555147', fontSize: 13, textDecoration: 'none', fontWeight: 700, borderBottom: '1px solid rgba(85,81,71,0.35)' }}>
                                    {t.auth.forgotPassword}
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} color="#A09080" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t.auth.passwordPlaceholder}
                                    required
                                    style={{ paddingRight: 44, paddingLeft: 44 }}
                                />
                                <button
                                    type="button"
                                    id="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'left' : 'right']: 14,
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#A09080',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                style={{ width: 18, height: 18, accentColor: '#C6A75E', cursor: 'pointer' }}
                            />
                            <label htmlFor="rememberMe" style={{ color: '#6B6058', fontSize: 14, cursor: 'pointer' }}>{t.auth.rememberMe}</label>
                        </div>

                        <button
                            type="submit"
                            id="submit-login-btn"
                            disabled={loading}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: '#222222', color: 'white',
                                border: 'none', padding: '14px 24px', borderRadius: 10,
                                fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', letterSpacing: '0.01em',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#111111' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#222222' }}
                        >
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : t.auth.loginBtn}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 28, color: '#6B6058', fontSize: 14 }}>
                        {t.auth.noAccount}{' '}
                        <Link href="/register" style={{ color: '#222222', fontWeight: 800, textDecoration: 'none', borderBottom: '1.5px solid #222222' }}>
                            {t.auth.createFreeAccount}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right: Dark decorative panel */}
            <div className="hide-on-mobile" style={{
                flex: 1,
                background: 'linear-gradient(160deg, #1C1C1C 0%, #2A2A2A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 60,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background orbs */}
                <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(198,167,94,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(198,167,94,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />

                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
                    {/* Icon container */}
                    <div style={{
                        width: 88, height: 88, borderRadius: '50%',
                        background: 'rgba(198,167,94,0.12)', border: '1px solid rgba(198,167,94,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 32px',
                    }}>
                        <Store size={40} color="#C6A75E" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: 30, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {t.auth.storeWaiting}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8 }}>
                        {t.auth.storeWaitingDesc}
                    </p>

                    {/* Stat pills */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
                        {[{ v: '2,500+', l: t.auth.stores }, { v: '98%', l: t.auth.satisfaction }, { v: '50K+', l: t.auth.ordersPerMonth }].map(s => (
                            <div key={s.l} style={{
                                background: 'rgba(198,167,94,0.1)', border: '1px solid rgba(198,167,94,0.2)',
                                borderRadius: 12, padding: '12px 20px', textAlign: 'center',
                            }}>
                                <div style={{ color: '#C6A75E', fontWeight: 900, fontSize: 20, direction: 'ltr' }}>{s.v}</div>
                                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 2 }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
