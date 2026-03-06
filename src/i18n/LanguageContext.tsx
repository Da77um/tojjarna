'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import ar, { Translations } from './ar'
import en from './en'

export type Lang = 'ar' | 'en'

const translations: Record<Lang, Translations> = { ar, en }

interface LanguageContextType {
    lang: Lang
    dir: 'rtl' | 'ltr'
    setLang: (lang: Lang) => void
    t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'ar',
    dir: 'rtl',
    setLang: () => { },
    t: ar,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('ar')

    function applyLang(lng: Lang) {
        const dir = lng === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lng
        document.documentElement.dir = dir
        // Font switching via CSS class
        document.documentElement.classList.remove('lang-ar', 'lang-en')
        document.documentElement.classList.add(`lang-${lng}`)
    }

    // On mount: read from localStorage or browser preference
    useEffect(() => {
        const stored = localStorage.getItem('tojjarna_lang') as Lang | null
        if (stored && (stored === 'ar' || stored === 'en')) {
            applyLang(stored)
            setLangState(stored)
        } else {
            // Detect browser language
            const browserLang = navigator.language?.startsWith('ar') ? 'ar' : 'en'
            applyLang(browserLang)
            setLangState(browserLang)
        }
    }, [])

    const setLang = (lng: Lang) => {
        localStorage.setItem('tojjarna_lang', lng)
        applyLang(lng)
        setLangState(lng)
    }

    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    const t = translations[lang]

    return (
        <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

// Main hook
export function useLanguage() {
    return useContext(LanguageContext)
}

// Shorthand — just returns t (translations object for current lang)
export function useT() {
    return useContext(LanguageContext).t
}
