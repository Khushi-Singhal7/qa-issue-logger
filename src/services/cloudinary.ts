export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

const STORAGE_KEY = 'qa_cloudinary_config';

// Load stored config or default fallback
export function getCloudinaryConfig(): CloudinaryConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load Cloudinary config from localStorage', e);
  }

  // Default configuration: can be customized by the tester anytime
  return {
    cloudName: '',
    uploadPreset: '',
    folder: 'qa-defects',
  };
}

export function saveCloudinaryConfig(config: CloudinaryConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName.trim() && cfg.uploadPreset.trim());
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload an image (File or Blob) to Cloudinary using an unsigned upload preset.
 */
export async function uploadImageToCloudinary(
  file: File | Blob,
  fileName?: string
): Promise<string> {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Please configure your Cloud Name and Upload Preset in Cloudinary Settings.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset.trim());
  if (config.folder) {
    formData.append('folder', config.folder.trim());
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName.trim()}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `Upload failed with HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Cloudinary Error: ${message}`);
  }

  const data: CloudinaryUploadResponse = await response.json();
  return data.secure_url;
}
