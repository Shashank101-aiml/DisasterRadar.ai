import { ExpoConfig, ConfigContext } from 'expo/config';

// Backend base URL, switchable per EAS build profile via the API_BASE_URL env var
// (set in eas.json's build profiles). Falls back to a local dev IP placeholder —
// replace with your machine's LAN IP for on-device Expo Go testing, or the deployed
// Fly.io URL once Phase 0 is live.
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://10.0.2.2:8000/api';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DisasterRadar.ai',
  slug: 'disasterradar-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#080c16',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ai.disasterradar.app'
  },
  android: {
    package: 'ai.disasterradar.app',
    adaptiveIcon: {
      backgroundColor: '#080c16',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png'
    },
    predictiveBackGestureEnabled: false,
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION']
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: ['expo-sharing'],
  extra: {
    apiBaseUrl: API_BASE_URL,
    eas: {
      projectId: '1f3f2911-89de-421a-8be8-262becd6cb31'
    }
  },
  owner: 'disaster-radar'
});
