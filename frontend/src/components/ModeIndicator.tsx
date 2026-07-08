
interface ModeIndicatorProps {
  mode: 'live' | 'offline' | null;
}

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  if (!mode) return null;

  return (
    <div className={`mode-indicator mode-${mode}`} aria-live="polite">
      <span className="dot" aria-hidden="true" />
      <span className="mode-text">
        {mode === 'live' ? 'Live AI Mode' : 'Offline Fallback Mode'}
      </span>
    </div>
  );
}
