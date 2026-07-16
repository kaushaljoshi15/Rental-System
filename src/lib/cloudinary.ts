import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️ Cloudinary environment variables are missing. Media upload signing and management will be bypassed.");
}

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
  secure: true
});

export { cloudinary };

/**
 * Generates a cryptographic signature for secure direct client uploads to Cloudinary.
 */
export function generateCloudinarySignature(params: Record<string, any>) {
  if (!apiSecret) {
    throw new Error("Cloudinary apiSecret is not defined.");
  }
  return cloudinary.utils.api_sign_request(params, apiSecret);
}
