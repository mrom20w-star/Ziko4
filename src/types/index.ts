export type PlatformId = 'bizbet';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  img: string;
  tagline: string;
  accuracy: string;
  latency: string;
  geo: string;
  recommended: boolean;
  appDownloadUrl: string;
  registerUrl: string;
  promoCode: string;
  telegramUrl: string;
}

export type GameId = 'apple' | 'crash' | 'mines';

export interface GameItem {
  id: GameId;
  title: string;
  subtitle: string;
  desc: string;
  img: string;
  badge: string;
  accuracy: string;
  hot: boolean;
}

export interface AppleMultiplierLevel {
  label: string;
  value: number;
  goodCount: number;
  badCount: number;
}

export interface CrashSignal {
  id: string;
  multiplier: number;
  time: string;
  confidence: number;
  status: 'safe' | 'high' | 'ultra';
}

export interface AccessCode {
  code: string;
  durationHours: number; // Duration in hours (e.g. 1 for 1 hour, 24 for 1 day, etc.)
  createdAt: number;
  activatedAt: number | null;
  expiresAt: number | null;
  boundDeviceId: string | null;
  boundDeviceLabel?: string;
  status: 'unused' | 'active' | 'expired';
  note?: string;
}

export type ScreenState =
  | 'code_activation'
  | 'platform_select'
  | 'activation_flow'
  | 'games_hub'
  | 'game_apple'
  | 'game_crash'
  | 'game_mines'
  | 'admin_dashboard';

export type Language = 'ar' | 'en';
