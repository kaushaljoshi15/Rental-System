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
          background: "linear-gradient(135deg, #0F172A 0%, #020617 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
          padding: "6px",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beast-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
          </defs>

          {/* Bottom shadow base */}
          <ellipse cx="50" cy="92" rx="25" ry="2.5" fill="url(#beast-icon-grad)" opacity="0.75" />

          {/* Main R Swooshes */}
          <g>
            {/* Location pin vibe center dot */}
            <circle cx="45" cy="37" r="4.5" fill="url(#beast-icon-grad)" />

            {/* Left vertical crescent/leaf */}
            <path
              d="
                M 42 12
                C 28 14, 26 48, 38 78
                C 41 83, 37 84, 32 82
                C 20 76, 18 52, 28 24
                C 31 16, 36 11, 42 12 Z"
              fill="url(#beast-icon-grad)"
            />

            {/* Top flame tip accent */}
            <path
              d="
                M 42 12
                C 35 10, 26 12, 26 12
                C 36 7, 50 9, 56 13
                C 48 13, 43 12, 42 12 Z"
              fill="url(#beast-icon-grad)"
            />

            {/* Top loop swoosh */}
            <path
              d="
                M 39 21
                C 52 15, 76 19, 78 33
                C 80 47, 68 53, 52 47
                C 48 45, 46 41, 46 41
                C 56 45, 68 39, 68 31
                C 68 23, 50 21, 39 21 Z"
              fill="url(#beast-icon-grad)"
            />

            {/* Middle leg/loop transition swoosh */}
            <path
              d="
                M 39 34
                C 52 32, 68 40, 66 52
                C 64 64, 50 74, 42 82
                C 40 84, 42 84, 44 82
                C 54 74, 70 64, 72 50
                C 74 36, 54 30, 39 34 Z"
              fill="url(#beast-icon-grad)"
            />

            {/* Bottom leg tail swoosh */}
            <path
              d="
                M 40 50
                C 47 52, 56 61, 52 74
                C 50 80, 53 82, 58 82
                C 73 82, 85 76, 85 76
                C 77 78, 65 78, 57 72
                C 53 66, 48 56, 40 50 Z"
              fill="url(#beast-icon-grad)"
            />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}





