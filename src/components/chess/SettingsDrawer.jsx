import React from 'react';
import { X, Volume2, VolumeX, Eye, Compass, Palette, Sliders, Sparkles } from 'lucide-react';
import { BOARD_THEMES } from '../../chess/themes';
import { soundEngine } from '../../chess/audio';

export function SettingsDrawer({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  pieceStyle,
  onSelectPieceStyle,
  soundEnabled,
  onToggleSound,
  showHints,
  onToggleHints,
  showEvalBar,
  onToggleEvalBar,
  showCoordinates,
  onToggleCoordinates,
  autoFlip,
  onToggleAutoFlip
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-outfit">
              Settings & Themes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Board Colorways */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Board Colorway
            </label>
            <div className="grid grid-cols-1 gap-2">
              {BOARD_THEMES.map((th) => {
                const isActive = theme.id === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onSelectTheme(th)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-200">
                      {th.name}
                    </span>
                    {/* Swatch Preview */}
                    <div className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-700 shadow-xs"
                        style={{ backgroundColor: th.light }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-700 shadow-xs"
                        style={{ backgroundColor: th.dark }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Piece Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Piece Artwork
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'staunton', name: 'Master Staunton' },
                { id: 'neo', name: 'Modern Minimal' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onSelectPieceStyle(style.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    pieceStyle === style.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span className="text-xs font-medium text-slate-200">Audio Sound Effects</span>
              </div>
              <button
                onClick={() => {
                  onToggleSound();
                  soundEngine.playMove();
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Legal Move Indicators */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-200">Legal Move Highlights</span>
              </div>
              <button
                onClick={onToggleHints}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showHints ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    showHints ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Evaluation Bar */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-200">Engine Evaluation Bar</span>
              </div>
              <button
                onClick={onToggleEvalBar}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showEvalBar ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    showEvalBar ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Board Coordinates */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">1..8</span>
                <span className="text-xs font-medium text-slate-200">Board Coordinates</span>
              </div>
              <button
                onClick={onToggleCoordinates}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showCoordinates ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    showCoordinates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Flip for Pass & Play */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">↻</span>
                <span className="text-xs font-medium text-slate-200">Auto-Flip in 2-Player</span>
              </div>
              <button
                onClick={onToggleAutoFlip}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoFlip ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                    autoFlip ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Apex Chess &copy; 2026 &bull; Master Standard
          </p>
        </div>
      </div>
    </div>
  );
}
