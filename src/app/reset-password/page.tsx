'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Store, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/i18n/LanguageContext'

export default function ResetPasswordPage() {
    const router = useRouter()
    const { t, dir } = useLanguage()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [sessionStatus, setSessionStatus] = useState<'valid' | 'invalid' | 'checking'>('checking')

    useEffect(() => {
        async function checkSession() {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    setSessionStatus('valid')
                } else {
                    // Check if we are in the middle of a recovery flow by looking at the URL fragment or query
                    const hash = window.location.hash
                    if (!hash || !hash.includes('access_token')) {
                        setSessionStatus('invalid')
                        setError(t.auth.resetLinkExpired)
                    } else {
                        // Sometimes Supabase takes a moment to process the fragment
                        setSessionStatus('valid')
                    }
                }
            } catch (err) {
                console.error('Session check error:', err)
                setSessionStatus('invalid')
            } finally {
                setCheckingSession(false)
            }
        }
        checkSession()
    }, [])

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError(t.auth.passwordMismatch)
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError(t.auth.passwordLength)
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            // Re-verify session exactly before update
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                throw new Error(t.auth.sessionExpired)
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) throw updateError
            setSuccess(true)

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t.auth.updatePasswordError
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.05)',
        border: '1.5px solid rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: 15,
        outline: 'none',
        transition: 'all 0.2s',
    }

    return (
        <div
            dir={dir}
            style={{
                minHeight: '100vh',
                background: '#0B0D17',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                fontFamily: 'Tajawal, Inter, sans-serif',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 450,
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 24,
                    padding: '40px 32px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                            marginBottom: 40,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
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
                        <span style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>باسكت</span>
                    </Link>

                    <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', marginBottom: 12 }}>
                        {t.auth.setNewPassword}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontSize: 15 }}>
                        {t.auth.enterNewPassword}
                    </p>

                    {checkingSession ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: '#6C3CE1' }} />
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{t.auth.checkingLink}</p>
                        </div>
                    ) : sessionStatus === 'invalid' ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ marginBottom: 20 }}>
                                <AlertTriangle size={64} color="#EF4444" style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ color: 'white', fontSize: 20, marginBottom: 12 }}>{t.auth.invalidLink}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 15 }}>
                                {error || t.auth.invalidLinkDesc}
                            </p>
                            <Link
                                href="/forgot-password"
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', textDecoration: 'none' }}
                            >
                                {t.auth.requestNewLink}
                            </Link>
                        </div>
                    ) : success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ marginBottom: 20 }}>
                                <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ color: 'white', fontSize: 20, marginBottom: 12 }}>{t.auth.passwordChanged}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 0, fontSize: 15 }}>
                                {t.auth.redirectingLogin}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            {error && (
                                <div
                                    style={{
                                        background: 'rgba(239,68,68,0.15)',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: 10,
                                        padding: '12px 16px',
                                        color: '#FCA5A5',
                                        fontSize: 14,
                                        marginBottom: 20,
                                        textAlign: 'right'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="form-group" style={{ textAlign: dir === 'rtl' ? 'right' : 'left', marginBottom: 20 }}>
                                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 8, display: 'block' }}>
                                    {t.auth.newPassword}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={18}
                                        color="rgba(255,255,255,0.3)"
                                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t.auth.passwordPlaceholder}
                                        required
                                        style={{ ...inputStyle, paddingRight: 44, paddingLeft: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            [dir === 'rtl' ? 'left' : 'right']: 14,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group" style={{ textAlign: dir === 'rtl' ? 'right' : 'left', marginBottom: 32 }}>
                                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 8, display: 'block' }}>
                                    {t.auth.confirmPassword}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock
                                        size={18}
                                        color="rgba(255,255,255,0.3)"
                                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t.auth.passwordPlaceholder}
                                        required
                                        style={{ ...inputStyle, [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 44 }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px 20px', fontSize: 16 }}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    t.auth.updatePassword
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
