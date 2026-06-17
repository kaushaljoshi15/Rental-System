import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(addressStr: string | null | undefined): string {
  if (!addressStr || addressStr.trim() === "") return "No address configured"
  try {
    const parsed = JSON.parse(addressStr)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const addr = parsed.find(a => a.isDefault) || parsed[0]
      const parts = [
        addr.name,
        addr.phone ? `Phone: ${addr.phone}` : null,
        addr.areaStreet,
        addr.locality,
        addr.city,
        `${addr.state} - ${addr.pincode}`
      ].filter(Boolean)
      return parts.join(", ")
    }
  } catch (e) {
    // Return original string if it is not valid JSON
  }
  return addressStr
}
