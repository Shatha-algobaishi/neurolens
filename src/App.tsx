import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./lib/theme/context";
import { LanguageProvider } from "./lib/i18n/context";

import LandingPage from "./pages/LandingPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import HomePage from "./pages/HomePage";
import GameHubPage from "./pages/GameHubPage";
import ReportPage from "./pages/ReportPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import StarCatcherGame from "./pages/games/StarCatcherGame";
import EmotionFriendsGame from "./pages/games/EmotionFriendsGame";
import LetterRaceGame from "./pages/games/LetterRaceGame";
import NumberWorldGame from "./pages/games/NumberWorldGame";
import TreasureMemoryGame from "./pages/games/TreasureMemoryGame";
import ColorSwitchGame from "./pages/games/ColorSwitchGame";
import GoNoGoGame from "./pages/games/GoNoGoGame";
import DotProbeGame from "./pages/games/DotProbeGame";
import RewardSensitivityGame from "./pages/games/RewardSensitivityGame";
import TrailMakingGame from "./pages/games/TrailMakingGame";
import FingerTappingGame from "./pages/games/FingerTappingGame";
import DelayedRecallGame from "./pages/games/DelayedRecallGame";
import QuickMathGame from "./pages/games/QuickMathGame";
import VoiceEchoGame from "./pages/games/VoiceEchoGame";
import FaceFocusGame from "./pages/games/FaceFocusGame";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/games" element={<GameHubPage />} />
            <Route path="/games/star-catcher" element={<StarCatcherGame />} />
            <Route path="/games/emotion-friends" element={<EmotionFriendsGame />} />
            <Route path="/games/letter-race" element={<LetterRaceGame />} />
            <Route path="/games/number-world" element={<NumberWorldGame />} />
            <Route path="/games/treasure-memory" element={<TreasureMemoryGame />} />
            <Route path="/games/color-switch" element={<ColorSwitchGame />} />
            <Route path="/games/go-no-go" element={<GoNoGoGame />} />
            <Route path="/games/dot-probe" element={<DotProbeGame />} />
            <Route path="/games/reward-sensitivity" element={<RewardSensitivityGame />} />
            <Route path="/games/trail-making" element={<TrailMakingGame />} />
            <Route path="/games/finger-tapping" element={<FingerTappingGame />} />
            <Route path="/games/delayed-recall" element={<DelayedRecallGame />} />
            <Route path="/games/quick-math" element={<QuickMathGame />} />
            <Route path="/games/voice-echo" element={<VoiceEchoGame />} />
            <Route path="/games/face-focus" element={<FaceFocusGame />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
