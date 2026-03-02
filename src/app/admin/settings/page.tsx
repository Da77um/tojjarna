'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Globe, Mail, Percent, ShieldAlert, CheckCircle, Store, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
    const supabase = createClient()
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        setLoading(true)
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .order('key', { ascending: true })
        if (data) setSettings(data)
        setLoading(false)
    }

    async function handleUpdateSetting(key: string, value: any) {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
    }

    async function saveAllSettings() {
        setSaving(true)
        setSuccess(false)

        try {
            for (const setting of settings) {
                const { error } = await supabase
                    .from('platform_settings')
                    .update({ value: setting.value })
                    .eq('key', setting.key)
                if (error) throw error
            }
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            toast.error('حدث خطأ أثناء حفظ الإعدادات: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    const findSetting = (key: string) => settings.find(s => s.key === key)

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                        إعدادات المنصة
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        تكوين الإعدادات العالمية لمنصة باسكت
                    </p>
                </div>
                <button
                    onClick={saveAllSettings}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
                >
                    {saving ? <RefreshCw className="spinner" size={18} /> : success ? <CheckCircle size={18} /> : <Save size={18} />}
                    {saving ? 'جاري الحفظ...' : success ? 'تم الحفظ بنجاح!' : 'حفظ جميع الإعدادات'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* General Settings */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={18} color="#6C3CE1" /> الإعدادات العامة
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>اسم المنصة</label>
                            <input
                                type="text"
                                className="form-control"
                                value={findSetting('platform_name')?.value || ''}
                                onChange={e => handleUpdateSetting('platform_name', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>بريد التواصل</label>
                            <div style={{ position: 'relative' }}>
                                <Mail
                                    size={16}
                                    color="rgba(255,255,255,0.3)"
                                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                />
                                <input
                                    type="email"
                                    className="form-control"
                                    value={findSetting('contact_email')?.value || ''}
                                    style={{ paddingRight: 40 }}
                                    onChange={e => handleUpdateSetting('contact_email', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Percent size={18} color="#F59E0B" /> الإعدادات المالية
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>عمولة المنصة الافتراضية (%)</label>
                            <div style={{ position: 'relative' }}>
                                <Percent
                                    size={16}
                                    color="rgba(255,255,255,0.3)"
                                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control"
                                    value={findSetting('global_commission')?.value || '0'}
                                    style={{ paddingRight: 40 }}
                                    onChange={e => handleUpdateSetting('global_commission', e.target.value)}
                                />
                            </div>
                            <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                يتم تطبيق هذه العمولة افتراضياً عند إنشاء متاجر جديدة ما لم يتم تحديد عمولة خاصة.
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ShieldAlert size={18} color="#EF4444" /> حالة النظام والصيانة
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: findSetting('is_maintenance')?.value === 'true' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.05)', border: findSetting('is_maintenance')?.value === 'true' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: findSetting('is_maintenance')?.value === 'true' ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw size={22} color="white" className={findSetting('is_maintenance')?.value === 'true' ? 'spinning' : ''} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 15 }}>وضع الصيانة</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                    {findSetting('is_maintenance')?.value === 'true' ? 'المنصة حالياً في وضع الصيانة ولن يتمكن المستخدمون من الوصول إليها' : 'المنصة نشطة حالياً وتعمل بشكل طبيعي'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUpdateSetting('is_maintenance', findSetting('is_maintenance')?.value === 'true' ? 'false' : 'true')}
                            className="btn"
                            style={{
                                background: findSetting('is_maintenance')?.value === 'true' ? '#10B981' : '#EF4444',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                fontWeight: 800,
                                borderRadius: 10
                            }}
                        >
                            {findSetting('is_maintenance')?.value === 'true' ? 'إيقاف وضع الصيانة' : 'تفعيل وضع الصيانة'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinning {
                    animation: spin 4s linear infinite;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    )
}
