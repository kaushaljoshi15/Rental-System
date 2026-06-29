import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F59E0B", // High-contrast brand Amber background
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          padding: "2px",
        }}
      >
        <div
          style={{
            color: "#0F172A",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 900,
            fontSize: "17px",
            letterSpacing: "-1.5px",
            display: "flex",
          }}
        >
          <span>R</span>
          <span>K</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
