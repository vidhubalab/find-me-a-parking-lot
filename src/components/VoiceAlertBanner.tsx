import React from 'react';
import { Volume2, VolumeX, AlertTriangle, Sparkles } from 'lucide-react';
import { voiceAlertService } from '../services/voiceAlertService';

interface VoiceAlertBannerProps {
  isSpeaking: boolean;
  lastSpokenText: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickSwitchToBackup?: () => void;
  backupName?: string;
  backupLots?: number;
}

export const VoiceAlertBanner: React.FC<VoiceAlertBannerProps> = ({
  isSpeaking,
  lastSpokenText,
  isMuted,
  onToggleMute,
  onQuickSwitchToBackup,
  backupName,
  backupLots,
}) => {
  if (!lastSpokenText && !isSpeaking) return null;

  const isUrgent = lastSpokenText?.toLowerCase().includes('alert') || lastSpokenText?.toLowerCase().includes('drop');

  return (
    <div
      role="region"
      aria-label="Voice announcement notification"
      className={`fixed top-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 transition-all duration-300 transform ${
        isSpeaking ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-95'
      }`}
    >
      <div
        className={`p-3.5 rounded-2xl shadow-xl backdrop-blur-xl border ${
          isUrgent
            ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-950/10'
            : 'bg-white border-emerald-300 text-slate-900 shadow-slate-900/10'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-5 h-5 animate-bounce" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isUrgent ? 'Urgent Driver Alert' : 'Hands-Free Voice Alert'}
              </span>
              {isSpeaking && (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-emerald-600 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-emerald-600 rounded-full animate-pulse delay-150" />
                </div>
              )}
            </div>

            <p className="text-xs font-semibold mt-1 leading-snug text-slate-900">
              {lastSpokenText}
            </p>

            {isUrgent && onQuickSwitchToBackup && backupName && (
              <button
                type="button"
                onClick={onQuickSwitchToBackup}
                className="mt-2.5 w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-98"
              >
                <span>Switch to {backupName} ({backupLots} lots)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </div>
  );
};
