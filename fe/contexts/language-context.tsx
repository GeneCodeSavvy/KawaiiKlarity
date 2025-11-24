"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type Language = "EN" | "JP"

interface Content {
  headline: string
  lead1: string
  lead2: string
  cta: string
  ctaAriaLabel: string
}

interface LanguageContextType {
  currentLang: Language
  content: Content
  isTransitioning: boolean
  switchLanguage: (newLang: Language) => Promise<void>
}

const contentDictionary: Record<Language, Content> = {
  EN: {
    headline: "Not sure what to wear today?\nMarin-chan will decide for you.",
    lead1: "Marin chan is weather-aware, and a dressing queen",
    lead2: "She can recognize your clothes with pictures, and select outfits that are cute, and perfectly you.",
    cta: "Chat with Marin Chan",
    ctaAriaLabel: "Chat with Marin Chan button - Start outfit consultation"
  },
  JP: {
    headline: "今日のコーデ、迷ってる？\nまりんちゃんがピタッと決めるよ。",
    lead1: "天気に合わせてスタイリング。まりんちゃんは着こなしのプロ。",
    lead2: "写真からあなたの服を判別して、\"可愛い\"をちゃんと選んでくれる — あなただけのコーデ提案。",
    cta: "まりんちゃんと相談する",
    ctaAriaLabel: "「まりんちゃんと相談する」ボタン — コーデ提案チャットを開始"
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<Language>("JP")
  const [isTransitioning, setIsTransitioning] = useState(false)

  const switchLanguage = async (newLang: Language) => {
    if (isTransitioning || newLang === currentLang) return
    
    setIsTransitioning(true)
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Change language
    setCurrentLang(newLang)
    
    // Wait for enter animation
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setIsTransitioning(false)
  }

  const content = contentDictionary[currentLang]

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        content,
        isTransitioning,
        switchLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}