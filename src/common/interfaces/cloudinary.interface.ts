/**
 * Interface for Cloudinary upload result
 */
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Interface for Cloudinary transformations
 */
export interface CloudinaryTransformations {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
  gravity?: string;
  effect?: string;
  angle?: number;
  radius?: number | string;
  overlay?: string;
  opacity?: number;
  border?: string;
  background?: string;
  [key: string]: any;
}