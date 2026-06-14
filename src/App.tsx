import { ArrowLeft, RotateCw, Settings, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerScene } from './components/SpinnerScene';
import { usePersistentState } from './hooks/usePersistentState';
import { type ThemeMode, useThemeMode } from './hooks/useThemeMode';
import { useTwoFingerSpin } from './hooks/useTwoFingerSpin';
import { logoSvgDataUri, SPINNER_LOGO_MAP } from './spinnerLogos';
import { type SpinnerVariant, spinnerVariants } from './spinnerVariants';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
const defaultSensitivity = 1;
const defaultDecay = 1.35;
const defaultSpinnerSize = 1;
const defaultSpinnerVariant: SpinnerVariant = 'classic';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSpinnerVariant(value: unknown): value is SpinnerVariant {
  return typeof value === 'string' && (spinnerVariants as readonly string[]).includes(value);
}

type Route = 'spinner' | 'settings';

function getRoute(): Route {
  return window.location.hash === '#/settings' ? 'settings' : 'spinner';
}

export function App() {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useThemeMode();
  const [sensitivity, setSensitivity] = usePersistentState('sensitivity', defaultSensitivity, isFiniteNumber);
  const [decay, setDecay] = usePersistentState('decay', defaultDecay, isFiniteNumber);
  const [spinnerSize, setSpinnerSize] = usePersistentState('size', defaultSpinnerSize, isFiniteNumber);
  const [spinnerVariant, setSpinnerVariant] = usePersistentState<SpinnerVariant>(
    'variant',
    defaultSpinnerVariant,
    isSpinnerVariant
  );
  const spin = useTwoFingerSpin({ sensitivity });
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToSettings = () => {
    window.location.hash = '/settings';
  };

  const navigateToSpinner = () => {
    window.location.hash = '/';
  };

  if (route === 'settings') {
    return (
      <main className="settings-page">
        <header className="settings-page-header">
          <button
            className="icon-button"
            type="button"
            aria-label={t('controls.back')}
            onClick={navigateToSpinner}
          >
            <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
          <h1>{t('controls.settings')}</h1>
        </header>

        <section className="settings-content" aria-label={t('controls.settings')}>
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

          <div>
            <p className="field-label">{t('controls.spinner')}</p>
            <div className="variant-grid" role="group" aria-label={t('controls.spinner')}>
              {spinnerVariants.map((variant) => {
                const logo = SPINNER_LOGO_MAP[variant];

                return (
                  <button
                    key={variant}
                    className={variant === spinnerVariant ? 'variant-card is-active' : 'variant-card'}
                    type="button"
                    aria-pressed={variant === spinnerVariant}
                    onClick={() => setSpinnerVariant(variant)}
                  >
                    <span
                      className={
                        logo
                          ? 'variant-preview variant-preview-logo'
                          : `variant-preview variant-preview-${variant}`
                      }
                      aria-hidden="true"
                    >
                      {logo ? <img className="variant-logo" src={logoSvgDataUri(logo)} alt="" /> : <span />}
                    </span>
                    <span className="variant-copy">
                      <strong>{logo ? logo.title : t(`variants.${variant}.name`)}</strong>
                      <small>{logo ? t('variants.logoHint') : t(`variants.${variant}.description`)}</small>
                    </span>
                  </button>
                );
              })}
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
        </section>
      </main>
    );
  }

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
          spinnerVariant={spinnerVariant}
        />
      </section>

      <header className="top-bar" onPointerDown={(event) => event.stopPropagation()}>
        <h1 className="app-title">{t('appName')}</h1>

        <button
          className="settings-button"
          type="button"
          aria-label={t('controls.settings')}
          onClick={navigateToSettings}
        >
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </header>

      <div className="spin-bar">
        <button
          className="spin-button"
          type="button"
          aria-label={t('controls.spin')}
          onPointerDown={(event) => {
            event.stopPropagation();
            spin.boostSpin();
            navigator.vibrate?.(12);
          }}
        >
          <RotateCw aria-hidden="true" size={22} strokeWidth={2.2} />
        </button>

        <button
          className="stop-button"
          type="button"
          aria-label={t('controls.reset')}
          onPointerDown={(event) => {
            event.stopPropagation();
            spin.stopSpin();
          }}
        >
          <Square aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
      </div>
    </main>
  );
}
