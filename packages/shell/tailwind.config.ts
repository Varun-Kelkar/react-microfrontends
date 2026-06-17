import type { Config } from 'tailwindcss';
import sharedPreset from '../shared/src/tailwind-preset';

const config: Config = {
  presets: [sharedPreset as Config],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
