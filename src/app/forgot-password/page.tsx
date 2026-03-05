'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Store, ArrowRight, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleResetRequest(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const supabase = createClient()
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (resetError) throw resetError
            setSuccess(true)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'حدث خطأ في إرسال طلب إعادة تعيين كلمة المرور'
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
            dir="rtl"
            style={{
                minHeight: '100vh',
                background: '#EFE8DD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                fontFamily: 'Tajawal, sans-serif',
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
                                boxShadow: '0 4px 12px rgba(34,34,34,0.2)',
                            }}
                        >
                            <Store size={20} color="#C6A75E" />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#111111' }}>تجارنا</span>
                    </Link>

                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111111', marginBottom: 12, letterSpacing: '-0.02em' }}>
                        إعادة تعيين كلمة المرور
                    </h1>
                    <p style={{ color: '#6B6058', marginBottom: 36, fontSize: 15, lineHeight: 1.6 }}>
                        أدخل بريدك الإلكتروني وسنرسل لك رابطاً <br /> لإعادة تعيين كلمة المرور الخاصة بك.
                    </p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ marginBottom: 20 }}>
                                <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ color: '#111111', fontSize: 20, marginBottom: 12, fontWeight: 800 }}>تم إرسال الرابط بنجاح!</h2>
                            <p style={{ color: '#6B6058', marginBottom: 32, fontSize: 15 }}>
                                يرجى التحقق من بريدك الإلكتروني في غضون ثوانٍ.
                            </p>
                            <Link
                                href="/login"
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', textDecoration: 'none' }}
                            >
                                <ArrowRight size={18} />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetRequest}>
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
                                        textAlign: 'right'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="form-group" style={{ textAlign: 'right', marginBottom: 24 }}>
                                <label className="form-label" style={{ color: '#555147', marginBottom: 8, display: 'block' }}>
                                    البريد الإلكتروني
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={18}
                                        color="#A09080"
                                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                    />
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        required
                                        style={{ ...inputStyle, paddingRight: 44 }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px 20px', fontSize: 16, marginBottom: 24 }}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    'إرسال رابط التعيين'
                                )}
                            </button>

                            <Link
                                href="/login"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    color: '#6B6058',
                                    fontSize: 14,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.color = '#111111')}
                                onMouseOut={(e) => (e.currentTarget.style.color = '#6B6058')}
                            >
                                <ArrowRight size={16} />
                                العودة لتسجيل الدخول
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
