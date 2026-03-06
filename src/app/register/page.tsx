'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Phone, Store, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function RegisterPage() {
    const router = useRouter()
    const { t, dir } = useLanguage()
    const [step, setStep] = useState<'signup' | 'otp'>('signup')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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

            // Sign up with email and password
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formData.phone,
                    },
                },
            })

            if (signUpError) throw signUpError

            // Move to OTP step
            setStep('otp')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t.auth.registerError
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        if (otp.length !== 6) {
            setError(t.auth.verifyError)
            return
        }

        setLoading(true)
        setError('')

        try {
            const supabase = createClient()
            // type: 'signup' for email verification after password signup
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            })

            if (verifyError) throw verifyError

            // Redirect to dashboard onboarding
            router.push('/dashboard/setup')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t.auth.verifyError
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    async function handleResendOtp() {
        setLoading(true)
        setError('')
        try {
            const supabase = createClient()
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email
            })
            if (resendError) throw resendError
            toast.success(t.auth.resendSuccess)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t.auth.resendError
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        paddingRight: 44,
    }

    const labelStyle = { color: '#6B6058' }

    return (
        <div
            dir={dir}
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#EFE8DD',
                padding: '48px 24px',
                fontFamily: 'Tajawal, Inter, sans-serif',
            }}
        >
            <div style={{ width: '100%', maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: '#222222',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(34,34,34,0.2)',
                            }}
                        >
                            <Store size={20} color="#C6A75E" />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#111111' }}>تجارنا</span>
                    </Link>

                    <LanguageSwitcher compact />
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111111', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {t.auth.createStoreToday}
                </h1>
                <p style={{ color: '#6B6058', marginBottom: 36, fontSize: 15 }}>
                    {t.auth.startFree}
                </p>

                <div
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E0D6C8',
                        borderRadius: 20,
                        padding: 32,
                    }}
                >
                    {step === 'signup' ? (
                        <form onSubmit={handleRegister}>
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
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>{t.auth.fullName}</label>
                                    <div style={{ position: 'relative' }}>
                                        <User
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t.auth.fullNamePlaceholder}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>{t.auth.phone}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder={t.auth.phonePlaceholder}
                                            style={{ ...inputStyle, textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={labelStyle}>{t.auth.email}</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={16}
                                        color="rgba(255,255,255,0.3)"
                                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t.auth.emailPlaceholder}
                                        required
                                        style={{ ...inputStyle, textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>{t.auth.password}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={t.auth.registerPasswordPlaceholder}
                                            required
                                            style={{ ...inputStyle, [dir === 'rtl' ? 'paddingLeft' : 'paddingRight']: 40 }}
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
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>{t.auth.confirmPassword}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 14 }}
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            className="form-control"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder={t.auth.passwordPlaceholder}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px 20px', fontSize: 16, marginTop: 8 }}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    t.auth.registerBtn
                                )}
                            </button>

                            <p style={{ color: '#6B6058', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
                                {t.auth.agreeTerms}{' '}
                                <Link href="/terms" style={{ color: '#222222', textDecoration: 'underline', fontWeight: 700 }}>{t.auth.terms}</Link>
                                {' '}{t.auth.and}{' '}
                                <Link href="/privacy" style={{ color: '#222222', textDecoration: 'underline', fontWeight: 700 }}>{t.auth.privacy}</Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <h3 style={{ color: '#111111', fontSize: 20, fontWeight: 900, marginBottom: 12, textAlign: 'center', letterSpacing: '-0.01em' }}>
                                {t.auth.verifyEmail}
                            </h3>
                            <p style={{ color: '#6B6058', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                                {t.auth.sentOtp} <br />
                                <strong style={{ color: '#111111', fontWeight: 800 }}>{formData.email}</strong>
                            </p>

                            {error && (
                                <div
                                    style={{
                                        background: 'rgba(192,57,43,0.08)',
                                        border: '1px solid rgba(192,57,43,0.25)',
                                        borderRadius: 10,
                                        padding: '12px 16px',
                                        color: '#8B1A1A',
                                        fontSize: 14,
                                        marginBottom: 20,
                                        textAlign: 'center'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label" style={{ ...labelStyle, textAlign: 'center', display: 'block' }}>
                                    {t.auth.verificationCode}
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="form-control"
                                    placeholder={t.auth.otpPlaceholder}
                                    required
                                    style={{
                                        ...inputStyle,
                                        textAlign: 'center',
                                        fontSize: 24,
                                        letterSpacing: 8,
                                        padding: '12px 20px',
                                        height: 60
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px 20px', fontSize: 16, marginTop: 16 }}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    t.auth.confirmAccountBtn
                                )}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <button
                                    type="button"
                                    onClick={() => setStep('signup')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6B6058',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {t.auth.changeEmail}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#C6A75E',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        display: 'block',
                                        margin: '0 auto',
                                        marginTop: 12,
                                        fontFamily: 'inherit',
                                        fontWeight: 700,
                                    }}
                                >
                                    {t.auth.resendCode}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: 24, color: '#6B6058', fontSize: 14 }}>
                    {t.auth.haveAccount}{' '}
                    <Link href="/login" style={{ color: '#222222', fontWeight: 800, textDecoration: 'none', borderBottom: '1.5px solid #222222' }}>
                        {t.auth.loginLink}
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link
                        href="/"
                        style={{
                            color: '#6B6058',
                            fontSize: 13,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            flexDirection: dir === 'rtl' ? 'row' : 'row-reverse',
                        }}
                    >
                        <ArrowLeft size={14} style={{ transform: dir === 'rtl' ? 'none' : 'rotate(180deg)' }} />
                        {t.auth.backToHome}
                    </Link>
                </div>
            </div>
        </div>
    )
}
