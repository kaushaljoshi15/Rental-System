import React from "react"

interface LogoProps {
  className?: string
  accentColor?: string
  textColor?: string
}

export function Logo({ className = "", accentColor = "#F59E0B", textColor = "#FFFFFF" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 130 38"
      className={`h-9 w-auto select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
          .rentkart-text-font {
            font-family: 'Fredoka', 'Fredoka One', system-ui, -apple-system, sans-serif;
            font-weight: 700;
          }
        ` }} />
      </defs>

      {/* Brand Text (Slightly larger, shifted to left) */}
      <text
        x="2"
        y="30"
        className="rentkart-text-font"
        style={{
          fontSize: "29px",
          letterSpacing: "-0.5px",
        }}
      >
        <tspan fill={textColor}>Rent</tspan>
        <tspan fill={accentColor}>kart</tspan>
      </text>
    </svg>
  )
}



