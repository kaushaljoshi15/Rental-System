import React from "react"

interface LogoProps {
  className?: string
  accentColor?: string
  textColor?: string
  isDark?: boolean
}

export function Logo({ className = "", textColor, isDark = false }: LogoProps) {
  const useWhite = isDark || textColor === "white" || textColor === "#fff" || textColor === "#ffffff"

  return (
    <img
      src={useWhite ? "/logo-white.svg" : "/logo.svg"}
      alt="RentKart"
      width={128}
      height={36}
      className={`h-9 w-auto select-none ${className}`}
      draggable={false}
    />
  )
}
