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
                background: '#0B0D17',
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
                        إعادة تعيين كلمة المرور 🔐
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontSize: 15, lineHeight: 1.6 }}>
                        أدخل بريدك الإلكتروني وسنرسل لك رابطاً <br /> لإعادة تعيين كلمة المرور الخاصة بك.
                    </p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ marginBottom: 20 }}>
                                <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ color: 'white', fontSize: 20, marginBottom: 12 }}>تم إرسال الرابط بنجاح!</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 15 }}>
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

                            <div className="form-group" style={{ textAlign: 'right', marginBottom: 24 }}>
                                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 8, display: 'block' }}>
                                    البريد الإلكتروني
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail
                                        size={18}
                                        color="rgba(255,255,255,0.3)"
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
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: 14,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.color = 'white')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
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
