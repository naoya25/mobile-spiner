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
        spinner: 'スピナー',
        sensitivity: '感度',
        size: '大きさ',
        decay: '減衰度',
        system: 'システム',
        light: 'ライト',
        dark: 'ダーク',
        reset: '回転を止める',
        spin: '回す'
      },
      variants: {
        classic: {
          name: 'Classic',
          description: '金属ベアリングの定番'
        },
        orbit: {
          name: 'Orbit',
          description: '惑星が公転する軌道'
        },
        flutter: {
          name: 'Flutter',
          description: '公式ロゴをそのまま回す'
        },
        neon: {
          name: 'Neon',
          description: '光るリングとブレード'
        }
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
        spinner: 'Spinner',
        sensitivity: 'Sensitivity',
        size: 'Size',
        decay: 'Decay',
        system: 'System',
        light: 'Light',
        dark: 'Dark',
        reset: 'Stop spin',
        spin: 'Spin'
      },
      variants: {
        classic: {
          name: 'Classic',
          description: 'Standard metal bearing'
        },
        orbit: {
          name: 'Orbit',
          description: 'Planets around a center'
        },
        flutter: {
          name: 'Flutter',
          description: 'Official logo in motion'
        },
        neon: {
          name: 'Neon',
          description: 'Glowing ring and blades'
        }
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
