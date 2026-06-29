import React from "react"

interface LogoProps {
  className?: string
  accentColor?: string
  textColor?: string
}

export function Logo({ className = "", accentColor = "#F59E0B", textColor = "#FFFFFF" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 140 38"
      className={`h-9 w-auto select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Letter R */}
      <text
        x="0"
        y="25"
        style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 900,
          fontSize: "26px",
          letterSpacing: "-0.75px",
        }}
      >
        <tspan fill={textColor}>R</tspan>
      </text>

      {/* Adjusted Looping "e" (translated 4px to the right to prevent overlap with R) */}
      <path
        d="M 19 18.5 H 29.5 C 29.5 13.5, 26 11.5, 23.5 11.5 C 19.5 11.5, 17.5 15, 17.5 18.5 C 17.5 22, 20 25.5, 24.5 25.5 C 28.5 25.5, 29.5 23, 29.5 21"
        stroke={textColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Letters "nt" and "Kart" (shifted to x=32 to accommodate the looping e) */}
      <text
        x="32"
        y="25"
        style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 900,
          fontSize: "26px",
          letterSpacing: "-0.75px",
        }}
      >
        <tspan fill={textColor}>nt</tspan>
        <tspan fill={accentColor}>Kart</tspan>
      </text>
    </svg>
  )
}
