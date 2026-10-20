import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnimatedBackground } from './components/AnimatedBackground';
import { LiveWinsTicker } from './components/LiveWinsTicker';
import { CodeActivationScreen } from './components/CodeActivationScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { PlatformSelectScreen } from './components/PlatformSelectScreen';
import { ActivationFlow } from './components/ActivationFlow';
import { GamesHub } from './components/GamesHub';
import { ApplePredictor } from './components/games/ApplePredictor';
import { CrashPredictor } from './components/games/CrashPredictor';
import { MinesPredictor } from './components/games/MinesPredictor';
import { PromoModal } from './components/modals/PromoModal';
import { InfoModal } from './components/modals/InfoModal';
import { TopUpModal } from './components/modals/TopUpModal';
import { ExpiredModal } from './components/modals/ExpiredModal';
import { PLATFORMS } from './data/platforms';
import { PlatformConfig, ScreenState, GameId, Language, AccessCode } from './types';
import { sound } from './utils/sound';
import { getDeviceId } from './utils/device';
import { checkActiveCodeValidity } from './services/firebase';

export default function App() {
  const [lang] = useState<Language>('ar');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig>(PLATFORMS[0]);
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('smart_ai_user_id') || '';
  });
  const [onlineCount, setOnlineCount] = useState(4120);

  // Active Code & Screen state
  const [activeCode, setActiveCode] = useState<string | null>(() => {
    return localStorage.getItem('smart_ai_active_code');
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    const saved = localStorage.getItem('smart_ai_active_code');
    return saved ? 'platform_select' : 'code_activation';
  });

  // Modals state
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isExpiredOpen, setIsExpiredOpen] = useState(false);

  const deviceId = getDeviceId();
  const telegramUrl = 'https://t.me/+4fSJ8LxoeN1mZGNk';

  // Natural fluctuation in online users count
  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(3800, Math.min(4600, prev + delta));
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Check code validity and countdown timer
  useEffect(() => {
    if (!activeCode) {
      setRemainingSeconds(null);
      return;
    }

    let isMounted = true;

    // Verify on server initially
    checkActiveCodeValidity(activeCode, deviceId).then((res) => {
      if (!isMounted) return;
      if (!res.isValid) {
        handleKickout();
      } else {
        setRemainingSeconds(res.remainingSeconds);
      }
    });

    // Countdown interval every second
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          handleKickout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Periodic server check every 20 seconds
    const serverCheck = setInterval(() => {
      checkActiveCodeValidity(activeCode, deviceId).then((res) => {
        if (!isMounted) return;
        if (!res.isValid) {
          handleKickout();
        } else {
          setRemainingSeconds(res.remainingSeconds);
        }
      });
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(serverCheck);
    };
  }, [activeCode]);

  const handleKickout = () => {
    localStorage.removeItem('smart_ai_active_code');
    setActiveCode(null);
    setRemainingSeconds(null);
    setCurrentScreen('code_activation');
    setIsExpiredOpen(true);
    sound.playClick();
  };

  const handleCodeActivated = (codeData: AccessCode) => {
    localStorage.setItem('smart_ai_active_code', codeData.code);
    setActiveCode(codeData.code);
    const now = Date.now();
    const rem = codeData.expiresAt ? Math.max(0, Math.floor((codeData.expiresAt - now) / 1000)) : 3600;
    setRemainingSeconds(rem);
    setCurrentScreen('platform_select');
  };

  const handleProceedFromPlatform = () => {
    if (userId) {
      setCurrentScreen('games_hub');
    } else {
      setCurrentScreen('activation_flow');
    }
  };

  const handleCompleteActivation = (newUserId: string) => {
    setUserId(newUserId);
    localStorage.setItem('smart_ai_user_id', newUserId);
    setCurrentScreen('games_hub');
  };

  const handleSelectGame = (gameId: GameId) => {
    if (gameId === 'apple') setCurrentScreen('game_apple');
    else if (gameId === 'crash') setCurrentScreen('game_crash');
    else if (gameId === 'mines') setCurrentScreen('game_mines');
  };

  return (
    <div
      className="min-h-screen bg-[#06070a] text-white flex flex-col relative selection:bg-[#ff1e38]/40 font-sans"
      dir="rtl"
    >
      {/* Animated Background: Constellation Canvas + Glowing Blobs + Smart Cyber Grid */}
      <AnimatedBackground />

      {/* Header: هاك زيكو الروسي + Only Telegram in Actions */}
      <Header
        onlineCount={onlineCount}
        latency={selectedPlatform.latency}
        activeCodeRemainingSeconds={remainingSeconds}
        telegramUrl={telegramUrl}
      />

      {/* Live Wins Ticker */}
      <LiveWinsTicker lang={lang} />

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 flex flex-col justify-start pb-12">
        {currentScreen === 'code_activation' && (
          <CodeActivationScreen
            onCodeActivated={handleCodeActivated}
            onOpenAdmin={() => setCurrentScreen('admin_dashboard')}
            lang={lang}
          />
        )}

        {currentScreen === 'admin_dashboard' && (
          <AdminDashboard
            onBack={() => {
              if (activeCode) setCurrentScreen('platform_select');
              else setCurrentScreen('code_activation');
            }}
            lang={lang}
          />
        )}

        {currentScreen === 'platform_select' && (
          <PlatformSelectScreen
            selectedPlatform={selectedPlatform}
            onSelectPlatform={(p) => setSelectedPlatform(p)}
            onProceed={handleProceedFromPlatform}
            lang={lang}
          />
        )}

        {currentScreen === 'activation_flow' && (
          <ActivationFlow
            platform={selectedPlatform}
            onBack={() => setCurrentScreen('platform_select')}
            onComplete={handleCompleteActivation}
            lang={lang}
          />
        )}

        {currentScreen === 'games_hub' && (
          <GamesHub
            platform={selectedPlatform}
            userId={userId}
            onSelectGame={handleSelectGame}
            onBack={() => setCurrentScreen('platform_select')}
            lang={lang}
          />
        )}

        {currentScreen === 'game_apple' && (
          <ApplePredictor
            platform={selectedPlatform}
            userId={userId}
            onBack={() => setCurrentScreen('games_hub')}
            lang={lang}
          />
        )}

        {currentScreen === 'game_crash' && (
          <CrashPredictor
            platform={selectedPlatform}
            userId={userId}
            onBack={() => setCurrentScreen('games_hub')}
            lang={lang}
          />
        )}

        {currentScreen === 'game_mines' && (
          <MinesPredictor
            platform={selectedPlatform}
            userId={userId}
            onBack={() => setCurrentScreen('games_hub')}
            lang={lang}
          />
        )}
      </main>

      {/* Modals */}
      <PromoModal
        platform={selectedPlatform}
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        lang={lang}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        lang={lang}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        lang={lang}
      />

      <ExpiredModal
        isOpen={isExpiredOpen}
        onClose={() => setIsExpiredOpen(false)}
        lang={lang}
      />
    </div>
  );
}
