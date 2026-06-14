export const spinnerVariants = [
  'classic',
  'orbit',
  'neon',
  'flutter',
  'python',
  'rust',
  'tauri',
  'go',
  'gin',
  'next',
  'dart',
  'typescript',
  'react',
  'node',
  'docker'
] as const;

export type SpinnerVariant = (typeof spinnerVariants)[number];
