import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerScene } from './components/SpinnerScene';
import { type ThemeMode, useThemeMode } from './hooks/useThemeMode';
import { useTwoFingerSpin } from './hooks/useTwoFingerSpin';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
const defaultSensitivity = 1;
const defaultDecay = 1.35;
const defaultSpinnerSize = 1;

export function App() {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useThemeMode();
  const [sensitivity, setSensitivity] = useState(defaultSensitivity);
  const [decay, setDecay] = useState(defaultDecay);
  const [spinnerSize, setSpinnerSize] = useState(defaultSpinnerSize);
  const spin = useTwoFingerSpin({ sensitivity });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main
      className="app-shell"
      onPointerDown={spin.onPointerDown}
      onPointerMove={spin.onPointerMove}
      onPointerUp={spin.onPointerUp}
      onPointerCancel={spin.onPointerUp}
      onContextMenu={(event) => event.preventDefault()}
    >
      <section className="stage" aria-label={t('appName')}>
        <SpinnerScene
          angleRef={spin.angleRef}
          angularVelocityRef={spin.angularVelocityRef}
          decay={decay}
          anchorPosition={spin.anchorPosition}
          activeTouchCount={spin.activeTouchCount}
          spinnerSize={spinnerSize}
        />
      </section>

      <header className="top-bar" onPointerDown={(event) => event.stopPropagation()}>
        <h1 className="app-title">{t('appName')}</h1>

        <button
          className="settings-button"
          type="button"
          aria-label={t('controls.settings')}
          aria-expanded={isSettingsOpen}
          aria-controls="settings-panel"
          onClick={() => setIsSettingsOpen((current) => !current)}
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </header>

      {isSettingsOpen && (
        <aside
          id="settings-panel"
          className="settings-panel"
          aria-label={t('controls.settings')}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="settings-header">
            <h2>{t('controls.settings')}</h2>
            <button
              className="icon-button"
              type="button"
              aria-label={t('controls.close')}
              onClick={() => setIsSettingsOpen(false)}
            >
              x
            </button>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <span>{t('metrics.speed')}</span>
              <strong>{spin.speed.toFixed(1)}</strong>
            </div>
            <div className="metric">
              <span>{t('metrics.touch')}</span>
              <strong>{spin.activeTouchCount}</strong>
            </div>
          </div>

          <div>
            <p className="field-label">{t('controls.theme')}</p>
            <div className="theme-switcher" role="group" aria-label={t('controls.theme')}>
              {themeModes.map((mode) => (
                <button
                  key={mode}
                  className={mode === themeMode ? 'is-active' : ''}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                >
                  {t(`controls.${mode}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="range-field">
            <span>
              {t('controls.sensitivity')}
              <strong>{sensitivity.toFixed(1)}x</strong>
            </span>
            <input
              type="range"
              min="0.4"
              max="2.4"
              step="0.1"
              value={sensitivity}
              onChange={(event) => setSensitivity(Number(event.currentTarget.value))}
            />
          </label>

          <label className="range-field">
            <span>
              {t('controls.size')}
              <strong>{spinnerSize.toFixed(1)}x</strong>
            </span>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.1"
              value={spinnerSize}
              onChange={(event) => setSpinnerSize(Number(event.currentTarget.value))}
            />
          </label>

          <label className="range-field">
            <span>
              {t('controls.decay')}
              <strong>{decay.toFixed(1)}</strong>
            </span>
            <input
              type="range"
              min="0.4"
              max="3"
              step="0.1"
              value={decay}
              onChange={(event) => setDecay(Number(event.currentTarget.value))}
            />
          </label>

          <button className="secondary-button" type="button" onClick={spin.stopSpin}>
            {t('controls.reset')}
          </button>
        </aside>
      )}
    </main>
  );
}
