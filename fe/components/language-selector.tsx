"use client"

import { useLanguage } from "@/hooks/use-language"
import { Language } from "@/contexts/language-context"

export default function LanguageSelector() {
    const { currentLang, switchLanguage, isTransitioning } = useLanguage()

    const handleLanguageSwitch = async (newLang: Language) => {
        if (!isTransitioning) {
            await switchLanguage(newLang)
        }
    }

    return (
        <div className="border border-primary/40 rounded-lg font-medium text-sm flex items-center p-[0.18rem]" style={{ transform: "translateZ(0)" }}>
            <div
                onClick={() => handleLanguageSwitch("EN")}
                className={`group cursor-pointer transition-colors duration-200 px-2 py-1 rounded-lg border-2 ${
                    isTransitioning ? "pointer-events-none" : ""
                } ${currentLang === "EN"
                    ? "bg-background border-rose-400"
                    : "border-transparent opacity-30 hover:shadow-[inset_0_0_20px_var(--color-primary),0_0_20px_var(--color-primary)]"
                    }`}
            >
                <span
                    className={currentLang === "EN" ? "font-bold text-primary" : "font-normal text-primary/60 group-hover:font-bold group-hover:text-primary group-hover:drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-200"}
                >
                    EN
                </span>
            </div>
            <div
                onClick={() => handleLanguageSwitch("JP")}
                className={`group cursor-pointer transition-colors duration-200 px-2 py-1 rounded-lg border-2 ${
                    isTransitioning ? "pointer-events-none" : ""
                } ${currentLang === "JP"
                    ? "bg-background border-rose-400"
                    : "border-transparent opacity-30 hover:shadow-[inset_0_0_20px_var(--color-primary),0_0_20px_var(--color-primary)]"
                    }`}
            >
                <span
                    className={currentLang === "JP" ? "font-bold text-primary" : "font-normal text-primary/60 group-hover:font-bold group-hover:text-primary group-hover:drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-200"}
                >
                    JP
                </span>
            </div>
        </div>
    )
}
