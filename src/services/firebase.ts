import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue,
  Database,
} from 'firebase/database';
import { AccessCode } from '../types';

export const firebaseConfig = {
  apiKey: 'AIzaSyCC5-CsnGY5sMXzpNnnTPvDwdFu8aHX8cQ',
  authDomain: 'ziko-5fa27.firebaseapp.com',
  databaseURL: 'https://ziko-5fa27-default-rtdb.firebaseio.com',
  projectId: 'ziko-5fa27',
  storageBucket: 'ziko-5fa27.firebasestorage.app',
  messagingSenderId: '177756561652',
  appId: '1:177756561652:web:547eff48265a1ec4393ea1',
  measurementId: 'G-XMFNR6TK9L',
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let rtdb: Database | null = null;
try {
  rtdb = getDatabase(app);
} catch (e) {
  console.warn('Firebase RTDB init error:', e);
}

const LOCAL_STORAGE_KEY = 'smart_ai_access_codes';

// Seed initial default test codes if empty
const DEFAULT_SEED_CODES: AccessCode[] = [
  {
    code: 'SMART-1H-VIP',
    durationHours: 1, // 1 hour test code
    createdAt: Date.now() - 100000,
    activatedAt: null,
    expiresAt: null,
    boundDeviceId: null,
    status: 'unused',
    note: 'كود تجريبي لمدة 1 ساعة لجهاز واحد',
  },
  {
    code: 'SMART-24H-VIP',
    durationHours: 24, // 24 hours test code
    createdAt: Date.now() - 200000,
    activatedAt: null,
    expiresAt: null,
    boundDeviceId: null,
    status: 'unused',
    note: 'كود تجريبي لمدة 24 ساعة لجهاز واحد',
  },
];

function getLocalCodes(): Record<string, AccessCode> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  const initMap: Record<string, AccessCode> = {};
  DEFAULT_SEED_CODES.forEach((c) => {
    initMap[c.code] = c;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initMap));
  return initMap;
}

function saveLocalCodes(codes: Record<string, AccessCode>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(codes));
  } catch {}
}

/**
 * Fetch all codes from Firebase RTDB (with localStorage backup)
 */
export async function getAllAccessCodes(): Promise<AccessCode[]> {
  const localMap = getLocalCodes();
  if (!rtdb) {
    return Object.values(localMap);
  }

  try {
    const snapshot = await get(ref(rtdb, 'access_codes'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const merged = { ...localMap, ...data };
      saveLocalCodes(merged);
      return Object.values(merged);
    } else {
      // First time: upload default seed codes to Firebase
      for (const c of Object.values(localMap)) {
        await set(ref(rtdb, `access_codes/${c.code}`), c).catch(() => {});
      }
      return Object.values(localMap);
    }
  } catch (err) {
    console.warn('Firebase sync fallback to local storage:', err);
    return Object.values(localMap);
  }
}

/**
 * Save / Create new access code
 */
export async function createAccessCode(codeData: AccessCode): Promise<boolean> {
  const localMap = getLocalCodes();
  localMap[codeData.code] = codeData;
  saveLocalCodes(localMap);

  if (rtdb) {
    try {
      await set(ref(rtdb, `access_codes/${codeData.code}`), codeData);
    } catch (e) {
      console.warn('Firebase RTDB save error, saved locally:', e);
    }
  }
  return true;
}

/**
 * Delete access code
 */
export async function deleteAccessCode(code: string): Promise<boolean> {
  const localMap = getLocalCodes();
  delete localMap[code];
  saveLocalCodes(localMap);

  if (rtdb) {
    try {
      await remove(ref(rtdb, `access_codes/${code}`));
    } catch (e) {
      console.warn('Firebase RTDB remove error:', e);
    }
  }
  return true;
}

/**
 * Single-device verification and activation algorithm
 * - Binds code to deviceId permanently
 * - If code is bound to another deviceId, rejects with error
 * - Calculates expiresAt based on durationHours
 */
export async function verifyAndActivateCode(
  inputCode: string,
  deviceId: string,
  deviceLabel: string
): Promise<{ success: boolean; error?: string; codeData?: AccessCode }> {
  const cleanCode = inputCode.trim().toUpperCase();

  // Load codes
  const codes = await getAllAccessCodes();
  const found = codes.find((c) => c.code.toUpperCase() === cleanCode);

  if (!found) {
    return {
      success: false,
      error: 'الكود المدخل غير موجود! يرجى التأكد من كتابة الكود بشكل صحيح.',
    };
  }

  const now = Date.now();

  // Check if expired
  if (found.expiresAt && now > found.expiresAt) {
    found.status = 'expired';
    await createAccessCode(found);
    return {
      success: false,
      error: 'انتهت صلاحية هذا الكود! يرجى التواصل مع الإدارة لتجديد الاشتراك.',
    };
  }

  // Check single-device restriction
  if (found.boundDeviceId && found.boundDeviceId !== deviceId) {
    return {
      success: false,
      error:
        'هذا الكود مستخدم بالفعل على جهاز آخر! الكود مخصص لجهاز واحد فقط ولا يمكن مشاركته.',
    };
  }

  // If already active on THIS device
  if (found.status === 'active' && found.boundDeviceId === deviceId) {
    return {
      success: true,
      codeData: found,
    };
  }

  // Activate unused code for THIS device
  const durationMs = found.durationHours * 3600 * 1000;
  const updatedCode: AccessCode = {
    ...found,
    status: 'active',
    activatedAt: now,
    expiresAt: now + durationMs,
    boundDeviceId: deviceId,
    boundDeviceLabel: deviceLabel,
  };

  await createAccessCode(updatedCode);

  return {
    success: true,
    codeData: updatedCode,
  };
}

/**
 * Real-time active code check
 */
export async function checkActiveCodeValidity(
  code: string,
  deviceId: string
): Promise<{ isValid: boolean; remainingSeconds: number; reason?: string }> {
  const codes = await getAllAccessCodes();
  const found = codes.find((c) => c.code.toUpperCase() === code.toUpperCase());

  if (!found) {
    return { isValid: false, remainingSeconds: 0, reason: 'الكود لم يعد موجوداً' };
  }

  if (found.boundDeviceId && found.boundDeviceId !== deviceId) {
    return {
      isValid: false,
      remainingSeconds: 0,
      reason: 'الكود مرتبط بجهاز آخر',
    };
  }

  const now = Date.now();
  if (found.expiresAt && now >= found.expiresAt) {
    found.status = 'expired';
    await createAccessCode(found);
    return {
      isValid: false,
      remainingSeconds: 0,
      reason: 'انتهت مدة صلاحية الكود وتم تسجيل الخروج تلقائياً',
    };
  }

  const remaining = found.expiresAt ? Math.max(0, Math.floor((found.expiresAt - now) / 1000)) : 0;

  return {
    isValid: true,
    remainingSeconds: remaining,
  };
}

/**
 * 1️⃣ Generate Apple of Fortune 50-cell predictions based on difficulty
 * Matches exact structure specified for path m11
 */
export function generateApplePredictionsData(): Record<string, Record<string, string>> {
  const finalObject: Record<string, Record<string, string>> = {};

  // 10 rows (from 0 to 9)
  for (let r = 0; r < 10; r++) {
    let safeCount = 4;
    if (r >= 4 && r < 7) safeCount = 3; // rows 4, 5, 6
    if (r >= 7 && r < 9) safeCount = 2; // rows 7, 8
    if (r >= 9) safeCount = 1;          // row 9 (highest)

    const safeCols: number[] = [];
    while (safeCols.length < safeCount) {
      const randomCol = Math.floor(Math.random() * 5);
      if (!safeCols.includes(randomCol)) {
        safeCols.push(randomCol);
      }
    }

    for (let c = 0; c < 5; c++) {
      const mIndex = r * 5 + c + 1; // Formula: row * 5 + col + 1
      const mKey = `m${mIndex}`;
      const value = safeCols.includes(c) ? '1' : '0';
      finalObject[mKey] = { [mKey]: value };
    }
  }

  return finalObject;
}

const M11_STORAGE_KEY = 'smart_ai_m11_data';

/**
 * Save m11 predictions to Firebase Realtime Database
 */
export async function saveApplePredictions(data: Record<string, Record<string, string>>) {
  try {
    localStorage.setItem(M11_STORAGE_KEY, JSON.stringify(data));
  } catch {}

  if (rtdb) {
    try {
      const rRef = ref(rtdb, 'm11');
      await set(rRef, data);
    } catch (e) {
      console.warn('Firebase RTDB m11 set error:', e);
    }
  }
}

/**
 * Get m11 predictions from Firebase RTDB (with local fallback)
 */
export async function getApplePredictions(): Promise<Record<string, Record<string, string>>> {
  if (rtdb) {
    try {
      const snapshot = await get(ref(rtdb, 'm11'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        try {
          localStorage.setItem(M11_STORAGE_KEY, JSON.stringify(data));
        } catch {}
        return data;
      }
    } catch (e) {
      console.warn('Firebase RTDB m11 get error:', e);
    }
  }

  // Fallback to local
  try {
    const raw = localStorage.getItem(M11_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Generate initial if not existing
  const initial = generateApplePredictionsData();
  await saveApplePredictions(initial);
  return initial;
}

/**
 * Subscribe in real-time to m11 updates from Firebase RTDB
 */
export function subscribeToApplePredictions(
  callback: (data: Record<string, Record<string, string>>) => void
): () => void {
  if (!rtdb) {
    // If no rtdb, return static
    getApplePredictions().then(callback);
    return () => {};
  }

  try {
    const m11Ref = ref(rtdb, 'm11');
    const unsubscribe = onValue(m11Ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        try {
          localStorage.setItem(M11_STORAGE_KEY, JSON.stringify(data));
        } catch {}
        callback(data);
      } else {
        // Generate and save
        const initial = generateApplePredictionsData();
        saveApplePredictions(initial);
        callback(initial);
      }
    });

    return unsubscribe;
  } catch {
    getApplePredictions().then(callback);
    return () => {};
  }
}
