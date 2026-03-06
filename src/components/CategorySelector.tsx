'use client'

/**
 * CategorySelector — Mobile-first category picker
 *
 * On mobile (< 768px): opens a smooth bottom sheet with hierarchy navigation + search
 * On desktop: shows a clean dropdown panel
 *
 * Props:
 *   categories   — flat array from Supabase: { id, name_ar, name_en?, parent_id }
 *   value        — currently selected category id
 *   onChange     — callback(id: string, label: string)
 *   placeholder  — shown when nothing is selected
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Check, Tag, FolderOpen } from 'lucide-react'

export interface CategoryItem {
    id: string
    name_ar: string
    name_en?: string
    parent_id: string | null
}

interface Props {
    categories: CategoryItem[]
    value: string
    onChange: (id: string, label: string) => void
    placeholder?: string
}

/** Build tree from flat list */
function buildTree(flat: CategoryItem[]) {
    const map: Record<string, CategoryItem & { children: any[] }> = {}
    flat.forEach(c => { map[c.id] = { ...c, children: [] } })
    const roots: (CategoryItem & { children: any[] })[] = []
    flat.forEach(c => {
        if (c.parent_id && map[c.parent_id]) {
            map[c.parent_id].children.push(map[c.id])
        } else {
            roots.push(map[c.id])
        }
    })
    return { map, roots }
}

/** Resolve full path label for a category id */
function resolvePath(id: string, map: Record<string, any>): string {
    const parts: string[] = []
    let cur = map[id]
    while (cur) {
        parts.unshift(cur.name_ar)
        cur = cur.parent_id ? map[cur.parent_id] : null
    }
    return parts.join(' ← ')
}

export default function CategorySelector({ categories, value, onChange, placeholder = 'اختر تصنيفاً...' }: Props) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [levelStack, setLevelStack] = useState<string[]>([]) // stack of parent ids (empty = root)
    const [isMobile, setIsMobile] = useState(false)
    const searchRef = useRef<HTMLInputElement>(null)
    const sheetRef = useRef<HTMLDivElement>(null)

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const { map, roots } = useMemo(() => buildTree(categories), [categories])

    const selectedLabel = value && map[value] ? resolvePath(value, map) : ''

    // Current level items
    const currentParentId = levelStack[levelStack.length - 1] ?? null
    const currentItems = currentParentId
        ? (map[currentParentId]?.children ?? [])
        : roots

    // Search mode: flatten all and filter
    const searchResults = useMemo(() => {
        if (!search.trim()) return []
        const q = search.trim().toLowerCase()
        return categories.filter(c =>
            c.name_ar.toLowerCase().includes(q) ||
            (c.name_en || '').toLowerCase().includes(q)
        )
    }, [search, categories])

    const isSearching = search.trim().length > 0

    function openSheet() {
        setOpen(true)
        setLevelStack([])
        setSearch('')
        setTimeout(() => searchRef.current?.focus(), 300)
    }

    function close() {
        setOpen(false)
        setSearch('')
        setLevelStack([])
    }

    function selectCategory(id: string) {
        onChange(id, map[id]?.name_ar ?? '')
        close()
    }

    function navigateInto(id: string) {
        setLevelStack(prev => [...prev, id])
        setSearch('')
    }

    function navigateBack() {
        setLevelStack(prev => prev.slice(0, -1))
    }

    function clear(e: React.MouseEvent) {
        e.stopPropagation()
        onChange('', '')
    }

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    // Breadcrumb labels
    const breadcrumbs = levelStack.map(id => map[id]?.name_ar ?? '')

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={openSheet}
                style={{
                    width: '100%',
                    minHeight: 48,
                    padding: '12px 16px',
                    border: '1.5px solid #E0D6C8',
                    borderRadius: 12,
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'right',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C6A75E')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E0D6C8')}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <Tag size={16} color={value ? '#C6A75E' : '#A09080'} style={{ flexShrink: 0 }} />
                    <span style={{
                        fontSize: 15,
                        color: value ? '#111111' : '#A09080',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                    }}>
                        {value ? selectedLabel : placeholder}
                    </span>
                </div>
                {value ? (
                    <button
                        type="button"
                        onClick={clear}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0EBE3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                        <X size={13} color="#6B6058" />
                    </button>
                ) : (
                    <ChevronLeft size={16} color="#A09080" style={{ flexShrink: 0 }} />
                )}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    onClick={close}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 400,
                        animation: 'fadeInBg 0.2s ease',
                    }}
                />
            )}

            {/* Panel — bottom sheet on mobile, floating panel on desktop */}
            {open && (
                <div
                    ref={sheetRef}
                    dir="rtl"
                    style={isMobile ? {
                        // Mobile: bottom sheet
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 401,
                        background: '#FDFAF6',
                        borderRadius: '20px 20px 0 0',
                        maxHeight: '88vh',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideUpSheet 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                    } : {
                        // Desktop: floating dropdown
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        left: 0,
                        zIndex: 401,
                        background: '#FDFAF6',
                        borderRadius: 16,
                        maxHeight: 420,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideUpSheet 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                        border: '1px solid #E0D6C8',
                        marginTop: 6,
                    }}
                >
                    {/* Handle bar (mobile only) */}
                    {isMobile && (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D4C8BB' }} />
                        </div>
                    )}

                    {/* Sheet header */}
                    <div style={{
                        padding: isMobile ? '12px 20px 16px' : '16px 16px 12px',
                        borderBottom: '1px solid #EDE5DA',
                        flexShrink: 0,
                    }}>
                        {/* Title + close */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* Back button when inside a level */}
                                {levelStack.length > 0 && !isSearching && (
                                    <button
                                        type="button"
                                        onClick={navigateBack}
                                        style={{ width: 36, height: 36, borderRadius: 10, background: '#F0EBE3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <ChevronRight size={18} color="#4A4036" />
                                    </button>
                                )}
                                <span style={{ fontWeight: 800, fontSize: isMobile ? 17 : 15, color: '#111' }}>
                                    {isSearching ? 'نتائج البحث' : levelStack.length === 0 ? 'اختر تصنيفاً' : map[levelStack[levelStack.length - 1]]?.name_ar}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                style={{ width: 36, height: 36, borderRadius: 10, background: '#F0EBE3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={16} color="#4A4036" />
                            </button>
                        </div>

                        {/* Breadcrumb */}
                        {breadcrumbs.length > 0 && !isSearching && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                                <button type="button" onClick={() => setLevelStack([])} style={{ fontSize: 12, color: '#C6A75E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    الكل
                                </button>
                                {breadcrumbs.map((b, i) => (
                                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 12, color: '#A09080' }}>←</span>
                                        <button
                                            type="button"
                                            onClick={() => setLevelStack(prev => prev.slice(0, i + 1))}
                                            style={{ fontSize: 12, color: i === breadcrumbs.length - 1 ? '#111' : '#C6A75E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            {b}
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="#A09080" style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                ref={searchRef}
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="ابحث عن تصنيف..."
                                style={{
                                    width: '100%',
                                    padding: '11px 44px 11px 14px',
                                    border: '1.5px solid #E0D6C8',
                                    borderRadius: 10,
                                    background: '#FFFFFF',
                                    fontSize: 15,
                                    fontFamily: 'inherit',
                                    color: '#111',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#C6A75E')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E0D6C8')}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <X size={14} color="#A09080" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '8px 0 32px' : '8px 0', WebkitOverflowScrolling: 'touch' } as any}>
                        {isSearching ? (
                            /* Search results */
                            searchResults.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A09080', fontSize: 14 }}>
                                    لا توجد نتائج لـ «{search}»
                                </div>
                            ) : searchResults.map(cat => (
                                <CategoryRow
                                    key={cat.id}
                                    cat={cat}
                                    label={resolvePath(cat.id, map)}
                                    isSelected={value === cat.id}
                                    hasChildren={false}
                                    onSelect={() => selectCategory(cat.id)}
                                    onNavigate={() => { }}
                                    isMobile={isMobile}
                                />
                            ))
                        ) : (
                            /* Hierarchical browsing */
                            currentItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A09080', fontSize: 14 }}>
                                    لا توجد تصنيفات
                                </div>
                            ) : currentItems.map((cat: any) => (
                                <CategoryRow
                                    key={cat.id}
                                    cat={cat}
                                    label={cat.name_ar}
                                    isSelected={value === cat.id}
                                    hasChildren={cat.children.length > 0}
                                    onSelect={() => selectCategory(cat.id)}
                                    onNavigate={() => navigateInto(cat.id)}
                                    isMobile={isMobile}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* CSS animations */}
            <style>{`
                @keyframes slideUpSheet {
                    from { transform: translateY(24px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes fadeInBg {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
        </div>
    )
}

/* ── Single category row ── */
function CategoryRow({
    cat, label, isSelected, hasChildren, onSelect, onNavigate, isMobile,
}: {
    cat: CategoryItem & { children?: any[] }
    label: string
    isSelected: boolean
    hasChildren: boolean
    onSelect: () => void
    onNavigate: () => void
    isMobile: boolean
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '14px 20px' : '11px 16px',
                cursor: 'pointer',
                transition: 'background 0.12s ease',
                background: isSelected ? 'rgba(198,167,94,0.1)' : 'transparent',
                borderBottom: '1px solid #F5EFE7',
                gap: 12,
                minHeight: isMobile ? 56 : 48,
            }}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FAF6F0' }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
            {/* Icon */}
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'rgba(198,167,94,0.15)' : '#F0EBE3',
            }}>
                {hasChildren
                    ? <FolderOpen size={17} color={isSelected ? '#C6A75E' : '#8A7A6A'} />
                    : <Tag size={15} color={isSelected ? '#C6A75E' : '#8A7A6A'} />
                }
            </div>

            {/* Label — tapping selects the category */}
            <div
                style={{ flex: 1, minWidth: 0 }}
                onClick={onSelect}
            >
                <div style={{ fontSize: isMobile ? 16 : 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7A5C20' : '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </div>
                {hasChildren && (
                    <div style={{ fontSize: 12, color: '#A09080', marginTop: 2 }}>
                        {cat.children?.length ?? ''} تصنيف فرعي
                    </div>
                )}
            </div>

            {/* Right side: checkmark if selected + navigate arrow if has children */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {isSelected && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#C6A75E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} color="white" strokeWidth={3} />
                    </div>
                )}
                {hasChildren && (
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onNavigate() }}
                        style={{
                            width: 36, height: 36, borderRadius: 10, background: '#F0EBE3', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}
                        title="تصفح الفئات الفرعية"
                    >
                        <ChevronLeft size={16} color="#4A4036" />
                    </button>
                )}
            </div>
        </div>
    )
}
