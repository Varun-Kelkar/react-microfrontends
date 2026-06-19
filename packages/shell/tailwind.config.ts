import type { Config } from 'tailwindcss';
import sharedPreset from '../shared/src/tailwind-preset';

const config: Config = {
  presets: [sharedPreset as Config],
  content: [
    './src/**/*.{ts,tsx}',
    '../product-catalog/src/**/*.{ts,tsx}',
    '../cart/src/**/*.{ts,tsx}',
    '../checkout/src/**/*.{ts,tsx}',
    '../auth/src/**/*.{ts,tsx}',
    '../ui-kit/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
