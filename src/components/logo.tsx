import React from "react"

interface LogoProps {
  className?: string
  accentColor?: string
  textColor?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="RentKart"
      className={`h-9 w-auto select-none ${className}`}
      draggable={false}
    />
  )
}
