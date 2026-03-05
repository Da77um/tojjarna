'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegisterPage() {
    const router = useRouter()
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
            setError('كلمتا المرور غير متطابقتين')
            setLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
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
            const message = err instanceof Error ? err.message : 'حدث خطأ في إنشاء الحساب'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        if (otp.length !== 6) {
            setError('يرجى إدخال رمز التحقق المكون من 6 أرقام')
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
            const message = err instanceof Error ? err.message : 'رمز التحقق غير صحيح'
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
            toast.success('تم إعادة إرسال الرمز بنجاح')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'حدث خطأ في إعادة إرسال الرمز'
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
            dir="rtl"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#EFE8DD',
                padding: '48px 24px',
                fontFamily: 'Tajawal, sans-serif',
            }}
        >
            <div style={{ width: '100%', maxWidth: 500 }}>
                {/* Logo */}
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

                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111111', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    أنشئ متجرك اليوم
                </h1>
                <p style={{ color: '#6B6058', marginBottom: 36, fontSize: 15 }}>
                    ابدأ مجاناً، لا حاجة لبطاقة ائتمانية
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
                                    <label className="form-label" style={labelStyle}>الاسم الكامل</label>
                                    <div style={{ position: 'relative' }}>
                                        <User
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="محمد أحمد"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>رقم الهاتف</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="07XXXXXXXX"
                                            style={inputStyle}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={labelStyle}>البريد الإلكتروني</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={16}
                                        color="rgba(255,255,255,0.3)"
                                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        required
                                        style={inputStyle}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label" style={labelStyle}>كلمة المرور</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="6+ أحرف"
                                            required
                                            style={{ ...inputStyle, paddingLeft: 40 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                left: 14,
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
                                    <label className="form-label" style={labelStyle}>تأكيد كلمة المرور</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock
                                            size={16}
                                            color="rgba(255,255,255,0.3)"
                                            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            className="form-control"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
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
                                    'إنشاء الحساب مجاناً'
                                )}
                            </button>

                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
                                بإنشاء حساب، أنت توافق على{' '}
                                <Link href="/terms" style={{ color: '#8B5CF6', textDecoration: 'none' }}>شروط الخدمة</Link>
                                {' '}و{' '}
                                <Link href="/privacy" style={{ color: '#8B5CF6', textDecoration: 'none' }}>سياسة الخصوصية</Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <h3 style={{ color: 'white', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
                                تحقق من بريدك الإلكتروني 📩
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                                أرسلنا رمز تحقق مكون من 6 أرقام إلى <br />
                                <strong style={{ color: 'white' }}>{formData.email}</strong>
                            </p>

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
                                        textAlign: 'center'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label" style={{ ...labelStyle, textAlign: 'center', display: 'block' }}>
                                    رمز التحقق
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="form-control"
                                    placeholder="000000"
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
                                    'تأكيد الحساب'
                                )}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <button
                                    type="button"
                                    onClick={() => setStep('signup')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    تغيير البريد الإلكتروني
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#8B5CF6',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        display: 'block',
                                        margin: '0 auto',
                                        marginTop: 12
                                    }}
                                >
                                    إعادة إرسال الرمز
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" style={{ color: '#8B5CF6', fontWeight: 700, textDecoration: 'none' }}>
                        سجّل دخولك
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link
                        href="/"
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: 13,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <ArrowLeft size={14} />
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    )
}
