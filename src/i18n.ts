import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  ja: {
    translation: {
      appName: 'mobile spiner',
      status: {
        idle: '中央を1本目の指で押さえ、2本目で弾く',
        primed: '2本目の指で外側をスワイプ',
        spinning: '回転中',
        mouse: 'ドラッグで回転を試せます'
      },
      controls: {
        settings: '設定',
        back: '戻る',
        close: '閉じる',
        theme: 'テーマ',
        sensitivity: '感度',
        size: '大きさ',
        decay: '減衰度',
        system: 'システム',
        light: 'ライト',
        dark: 'ダーク',
        reset: '回転を止める'
      },
      metrics: {
        speed: '速度',
        touch: 'タッチ',
        fixed: '固定',
        swipe: 'スワイプ'
      }
    }
  },
  en: {
    translation: {
      appName: 'mobile spiner',
      status: {
        idle: 'Hold the center with one finger, then flick with a second finger',
        primed: 'Swipe the outside with your second finger',
        spinning: 'Spinning',
        mouse: 'Drag to test rotation'
      },
      controls: {
        settings: 'Settings',
        back: 'Back',
        close: 'Close',
        theme: 'Theme',
        sensitivity: 'Sensitivity',
        size: 'Size',
        decay: 'Decay',
        system: 'System',
        light: 'Light',
        dark: 'Dark',
        reset: 'Stop spin'
      },
      metrics: {
        speed: 'Speed',
        touch: 'Touch',
        fixed: 'Anchor',
        swipe: 'Swipe'
      }
    }
  }
} as const;

void i18next.use(initReactI18next).init({
  resources,
  lng: navigator.language.startsWith('ja') ? 'ja' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});
