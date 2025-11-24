"use client"

import { useState } from "react"

export default function LanguageSelector() {
    const [selectedLang, setSelectedLang] = useState("EN")

    return (
        <div className="border border-primary/20 rounded-lg font-medium text-sm flex items-center">
            <div
                className={`transition-colors duration-200 px-2 py-1 rounded border-2 ${selectedLang === "EN"
                    ? "bg-background border-rose-400"
                    : "border-transparent"
                    }`}
            >
                <button
                    onClick={() => setSelectedLang("EN")}
                    className={selectedLang === "EN" ? "font-bold text-primary" : "font-normal text-primary/60 hover:text-primary"}
                >
                    EN
                </button>
            </div>
            <div
                className={`transition-colors duration-200 px-2 py-1 rounded border-2 ${selectedLang === "JP"
                    ? "bg-background border-rose-400"
                    : "border-transparent"
                    }`}
            >
                <button
                    onClick={() => setSelectedLang("JP")}
                    className={selectedLang === "JP" ? "font-bold text-primary" : "font-normal text-primary/60 hover:text-primary"}
                >
                    JP
                </button>
            </div>
        </div>
    )
}
