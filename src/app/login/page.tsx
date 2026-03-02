'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
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
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            // User is signed in, check role
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user?.id)
                .single()

            if (profile?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="mobile-stack"
            style={{
                minHeight: '100vh',
                display: 'flex',
                background: 'linear-gradient(135deg, #0F0F17 0%, #1A1A2E 100%)',
            }}
        >
            {/* Left: Form */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 24px',
                }}
            >
                <div className="mobile-full-width" style={{ width: '100%', maxWidth: 420 }}>
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

                    <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 8 }}>
                        أهلاً بعودتك 👋
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontSize: 15 }}>
                        سجّل دخولك لإدارة متجرك
                    </p>

                    <form onSubmit={handleLogin}>
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

                        <div className="form-group">
                            <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)' }}>
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
                                    style={{
                                        paddingRight: 44,
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1.5px solid rgba(255,255,255,0.12)',
                                        color: 'white',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                    كلمة المرور
                                </label>
                                <Link href="/forgot-password" style={{ color: '#8B5CF6', fontSize: 13, textDecoration: 'none' }}>
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    color="rgba(255,255,255,0.3)"
                                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        paddingRight: 44,
                                        paddingLeft: 44,
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1.5px solid rgba(255,255,255,0.12)',
                                        color: 'white',
                                    }}
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
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    accentColor: '#8B5CF6',
                                    cursor: 'pointer'
                                }}
                            />
                            <label htmlFor="rememberMe" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                                تذكرني
                            </label>
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
                                'تسجيل الدخول'
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 28, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        ليس لديك حساب؟{' '}
                        <Link href="/register" style={{ color: '#8B5CF6', fontWeight: 700, textDecoration: 'none' }}>
                            أنشئ حسابك مجاناً
                        </Link>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
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

            {/* Right: Decorative panel (hidden on mobile) */}
            <div
                className="hide-on-mobile"
                style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6C3CE1 0%, #8B5CF6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 48,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: -80,
                        right: -80,
                        width: 300,
                        height: 300,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '50%',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -60,
                        left: -60,
                        width: 200,
                        height: 200,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '50%',
                    }}
                />
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            border: '2px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <Store size={48} color="white" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                        متجرك بانتظارك
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.8, maxWidth: 320 }}>
                        أكثر من 2500 تاجر أردني يديرون متاجرهم الآن عبر باسكت ويحققون أرباحاً يومية
                    </p>
                </div>
            </div>
        </div>
    )
}
