'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    BarChart3, Store, Wallet, TrendingUp, ShieldAlert,
    Settings, Rocket, Puzzle, LogOut, Menu, X, Bell, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import '@/app/globals.css' // Assuming we have some global resets

const navItems = [
    { href: '/admin', label: 'نظرة عامة', icon: BarChart3 },
    { href: '/admin/stores', label: 'إدارة المتاجر', icon: Store },
    { href: '/admin/finance', label: 'المركز المالي', icon: Wallet },
    { href: '/admin/analytics', label: 'التحليلات', icon: TrendingUp },
    { href: '/admin/risk', label: 'أمن ومخاطر', icon: ShieldAlert },
    { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
    { href: '/admin/growth', label: 'أدوات النمو', icon: Rocket },
    { href: '/admin/marketplace', label: 'الماركت', icon: Puzzle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const supabase = createClient()
    const router = useRouter()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Admin theme colors
    const primary = '#6C3CE1' // Neon purple
    const bgDark = '#0F111A' // Deep navy/black background
    const surfaceDark = '#161A28' // Slightly lighter surface
    const borderDark = '#2D3348'
    const textBright = '#F3F4F6'
    const textMuted = '#9CA3AF'

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.push('/login')
            } else if (session?.user) {
                loadProfile(session.user)
            }
        })

        async function loadProfile(authUser: any) {
            try {
                const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
                if (data?.role !== 'admin') {
                    router.push('/dashboard')
                } else {
                    setUser(data || authUser)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/login')
            else loadProfile(user)
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgDark }}>
            <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: bgDark, color: textBright, fontFamily: 'Tajawal, Inter, sans-serif', direction: 'rtl' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside style={{
                width: 260,
                background: surfaceDark,
                borderLeft: `1px solid ${borderDark}`,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                right: 0,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.2s ease',
                zIndex: 100,
            }} className="admin-sidebar-mobile">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (min-width: 1024px) {
                        .admin-sidebar-mobile { transform: translateX(0) !important; position: static !important; }
                        .admin-menu-btn { display: none !important; }
                    }
                ` }} />

                {/* Logo & Branding */}
                <div style={{ padding: '24px 20px', borderBottom: `1px solid ${borderDark}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${primary}, #8B5CF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${primary}40`, flexShrink: 0 }}>
                        <Store size={22} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>تجارنا</div>
                        <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 4, letterSpacing: '0.05em' }}>مركز التحكم (Admin)</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                                background: isActive ? 'rgba(108,60,225,0.15)' : 'transparent',
                                color: isActive ? 'white' : textMuted,
                                fontWeight: isActive ? 700 : 500,
                                border: `1px solid ${isActive ? 'rgba(108,60,225,0.3)' : 'transparent'}`,
                                transition: 'all 0.15s ease'
                            }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                                        (e.currentTarget as HTMLElement).style.color = 'white';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLElement).style.color = textMuted;
                                    }
                                }}
                            >
                                <Icon size={18} color={isActive ? primary : 'currentColor'} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div style={{ padding: '20px 16px', borderTop: `1px solid ${borderDark}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1F2937', border: `1px solid ${borderDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color={textMuted} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'مالك المنصة'}</div>
                            <div style={{ fontSize: 11, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s'
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <LogOut size={16} /> تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Topbar */}
                <header style={{
                    height: 70, background: surfaceDark, borderBottom: `1px solid ${borderDark}`, padding: '0 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: textBright, cursor: 'pointer', display: 'flex' }}>
                            <Menu size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Search Bar (Mock) */}
                        <div style={{ position: 'relative', display: 'none' }} className="admin-search-desktop">
                            <style dangerouslySetInnerHTML={{ __html: `@media (min-width: 768px) { .admin-search-desktop { display: block !important; } }` }} />
                            <input type="text" placeholder="ابحث عن متجر، طلب، معاملة..." style={{
                                width: 280, padding: '10px 16px 10px 36px', borderRadius: 100, background: '#1F2937', border: `1px solid ${borderDark}`,
                                color: 'white', outline: 'none', fontSize: 13, fontFamily: 'inherit'
                            }}
                                onFocus={e => e.target.style.borderColor = primary}
                                onBlur={e => e.target.style.borderColor = borderDark}
                            />
                        </div>

                        {/* Notification Bell */}
                        <button style={{
                            width: 40, height: 40, borderRadius: '50%', border: `1px solid ${borderDark}`, background: '#1F2937',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#374151'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1F2937'}
                        >
                            <Bell size={18} color={textMuted} />
                            <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#EF4444', border: `2px solid ${surfaceDark}` }} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
