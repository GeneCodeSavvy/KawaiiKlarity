"use client"

import { useState } from "react"

export default function LanguageSelector() {
    const [selectedLang, setSelectedLang] = useState("EN")

    return (
        <div className="border border-primary/40 rounded-lg font-medium text-sm flex items-center p-[0.18rem]" style={{ transform: "translateZ(0)" }}>
            <div
                onClick={() => setSelectedLang("EN")}
                className={`group cursor-pointer transition-colors duration-200 px-2 py-1 rounded-lg border-2 ${selectedLang === "EN"
                    ? "bg-background border-rose-400"
                    : "border-transparent opacity-30 hover:shadow-[inset_0_0_20px_var(--color-primary),0_0_20px_var(--color-primary)]"
                    }`}
            >
                <span
                    className={selectedLang === "EN" ? "font-bold text-primary" : "font-normal text-primary group-hover:font-bold group-hover:text-primary group-hover:drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-200"}
                >
                    EN
                </span>
            </div>
            <div
                onClick={() => setSelectedLang("JP")}
                className={`group cursor-pointer transition-colors duration-200 px-2 py-1 rounded-lg border-2 ${selectedLang === "JP"
                    ? "bg-background border-rose-400"
                    : "border-transparent opacity-30 hover:shadow-[inset_0_0_20px_var(--color-primary),0_0_20px_var(--color-primary)]"
                    }`}
            >
                <span
                    className={selectedLang === "JP" ? "font-bold text-primary" : "font-normal text-primary/60 group-hover:font-bold group-hover:text-primary group-hover:drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-200"}
                >
                    JP
                </span>
            </div>
        </div>
    )
}
