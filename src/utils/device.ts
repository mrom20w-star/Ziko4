/**
 * Device fingerprinting and identification utility
 * Enforces single-device lock for activation codes
 */

export function getDeviceId(): string {
  const STORAGE_KEY = 'smart_ai_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    // Generate a unique fingerprint based on device hardware specs + random entropy
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const navInfo = `${navigator.userAgent}-${navigator.language}-${navigator.hardwareConcurrency || 4}`;
    
    // Hash-like deterministic string
    let hash = 0;
    const raw = `${screenInfo}-${navInfo}`;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    deviceId = `DEV-${Math.abs(hash).toString(36).toUpperCase()}-${randomHex}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}

export function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  let os = 'Unknown Device';
  if (/android/i.test(ua)) os = 'Android Device';
  else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS Device';
  else if (/Win/i.test(ua)) os = 'Windows PC';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';

  return `${os} (${browser})`;
}
