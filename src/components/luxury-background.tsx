'use client'

import React from "react"

export function LuxuryBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Luxury Atmosphere Gradient Canvas */}
      <div 
        className="absolute inset-0 bg-[#F5F4F2]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 12%, rgba(197, 168, 128, 0.16) 0%, transparent 45%),
            radial-gradient(circle at 82% 16%, rgba(230, 224, 240, 0.6) 0%, transparent 48%),
            radial-gradient(circle at 50% 50%, rgba(250, 245, 239, 0.65) 0%, transparent 55%),
            radial-gradient(circle at 12% 78%, rgba(197, 168, 128, 0.14) 0%, transparent 45%),
            radial-gradient(circle at 88% 85%, rgba(230, 224, 240, 0.5) 0%, transparent 50%)
          `
        }}
      />

      {/* 2. Floating Animated Ambient Light Orbs */}
      {/* Orb 1: Champagne Gold (Top Left) */}
      <div 
        className="absolute -top-24 -left-20 w-[520px] h-[520px] rounded-full animate-float-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(197, 168, 128, 0.28) 0%, rgba(197, 168, 128, 0) 70%)",
          filter: "blur(90px)",
          willChange: "transform"
        }}
      />

      {/* Orb 2: Pale Lavender Bloom (Top Right) */}
      <div 
        className="absolute top-12 -right-28 w-[640px] h-[640px] rounded-full animate-float-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(230, 224, 240, 0.75) 0%, rgba(230, 224, 240, 0) 70%)",
          filter: "blur(100px)",
          willChange: "transform"
        }}
      />

      {/* Orb 3: Warm Mocha & Champagne Ambient Glow (Mid Viewport) */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[450px] rounded-full animate-float-orb-3"
        style={{
          background: "radial-gradient(ellipse, rgba(197, 168, 128, 0.16) 0%, rgba(250, 245, 239, 0.4) 40%, rgba(245, 244, 242, 0) 70%)",
          filter: "blur(110px)",
          willChange: "transform"
        }}
      />

      {/* Orb 4: Pale Lavender & Platinum Mist (Bottom Right) */}
      <div 
        className="absolute -bottom-32 right-1/4 w-[580px] h-[580px] rounded-full animate-float-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(230, 224, 240, 0.6) 0%, rgba(230, 224, 240, 0) 70%)",
          filter: "blur(95px)",
          willChange: "transform"
        }}
      />

      {/* 3. Luxury Architectural Dot Matrix Grid with Radial Vignette */}
      <div 
        className="absolute inset-0 opacity-[0.65]"
        style={{
          backgroundImage: "radial-gradient(rgba(111, 78, 55, 0.08) 1.25px, transparent 1.25px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, black 40%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, black 40%, transparent 95%)"
        }}
      />

      {/* 4. Subtle Top Radial Horizon Glow (Gives an elegant backlight beneath the navbar) */}
      <div 
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(197, 168, 128, 0.18) 0%, transparent 100%)"
        }}
      />
    </div>
  )
}
