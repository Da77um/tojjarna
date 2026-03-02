import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Store,
    BarChart3,
    DollarSign,
    Settings,
    FileText,
    LogOut,
    ShieldCheck,
} from 'lucide-react'

const navItems = [
    { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/admin/vendors', label: 'التجار', icon: Store },
    { href: '/admin/users', label: 'المستخدمون', icon: Users },
    { href: '/admin/plans', label: 'خطط الاشتراك', icon: DollarSign },
    { href: '/admin/analytics', label: 'التحليلات', icon: BarChart3 },
    { href: '/admin/content', label: 'إدارة المحتوى', icon: FileText },
    { href: '/admin/settings', label: 'إعدادات المنصة', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Admin Sidebar */}
            <aside
                style={{
                    width: 260,
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    background: '#0F0F17',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    overflowY: 'auto',
                }}
            >
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShieldCheck size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>باسكت</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>لوحة الإدارة</div>
                        </div>
                    </div>
                </div>

                {/* Admin badge */}
                <div style={{ padding: '12px 16px' }}>
                    <div
                        style={{
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <ShieldCheck size={14} color="#EF4444" />
                        <span style={{ color: '#FCA5A5', fontSize: 12, fontWeight: 700 }}>صلاحيات المدير</span>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '8px 0' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '11px 16px',
                                    margin: '2px 10px',
                                    borderRadius: 10,
                                    color: 'rgba(255,255,255,0.6)',
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'none',
                            border: 'none',
                            color: 'rgba(239,68,68,0.7)',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div style={{ marginRight: 260, flex: 1 }}>
                {/* Header */}
                <header
                    style={{
                        height: 60,
                        background: '#0F0F17',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 28px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 40,
                    }}
                >
                    <div />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EF4444, #EC4899)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: 14,
                            }}
                        >
                            م
                        </div>
                        <div>
                            <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>المدير</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>super admin</div>
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </div>
    )
}
