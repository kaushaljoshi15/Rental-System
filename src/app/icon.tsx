import { ImageResponse } from "next/og"

// Image metadata - 48x48 is the official recommended size for Google search favicons
export const size = {
  width: 48,
  height: 48,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0B0F19 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          border: "2px solid rgba(245, 158, 11, 0.4)", // Brand Amber glow outline
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Creative 'Rolling Kart' R Design: combines letter R with a shopping cart */}
          
          {/* Cart Handle (top left) - White for high contrast */}
          <rect
            x="12"
            y="20"
            width="12"
            height="6"
            rx="3"
            fill="#FFFFFF"
          />

          {/* Vertical Stem (back of cart) - Brand Amber */}
          <rect
            x="20"
            y="20"
            width="12"
            height="52"
            rx="6"
            fill="#F59E0B"
          />

          {/* Upper Loop (basket) - Brand Amber */}
          <path
            d="M 38 26 H 54 C 66 26, 72 32, 72 40 C 72 48, 66 54, 54 54 H 38"
            stroke="#F59E0B"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />

          {/* Diagonal Leg (front support) - Brand Amber */}
          <path
            d="M 50 52 L 70 70"
            stroke="#F59E0B"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />

          {/* Rear Wheel (bottom of stem) - White rim, dark midnight center */}
          <circle cx="26" cy="76" r="8" fill="#FFFFFF" />
          <circle cx="26" cy="76" r="3.5" fill="#0F172A" />

          {/* Front Wheel (bottom of leg) - White rim, dark midnight center */}
          <circle cx="70" cy="74" r="8" fill="#FFFFFF" />
          <circle cx="70" cy="74" r="3.5" fill="#0F172A" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}





