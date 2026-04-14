import React, { useEffect } from 'react';
import { View, Platform, StyleSheet, StatusBar, I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { initI18n } from './src/i18n';

/**
 * On web: render the app inside a mobile phone frame (390x844 = iPhone 14 pro dimensions)
 * On mobile: full-screen native rendering
 */
export default function App() {
  useEffect(() => {
    initI18n();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1F30" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const PHONE_W = 390;
const PHONE_H = 844;

const webStyles = StyleSheet.create({
  pageBg: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    alignItems: 'center',
    justifyContent: 'center',
    // Web-only gradient via linear-gradient isn't supported natively;
    // we use a plain dark background instead.
  },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },

  phoneShadowWrap: {
    shadowColor: '#00c2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 80,
    elevation: 40,
  },
  phoneFrame: {
    width: PHONE_W,
    height: PHONE_H,
    backgroundColor: '#111827',
    borderRadius: 54,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  notch: {
    width: 126,
    height: 34,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  notchCamera: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 52,
    overflow: 'hidden',
    backgroundColor: '#0D1F30',
  },
  homeBar: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  bottomLabel: {
    marginTop: 24,
    alignItems: 'center',
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
});
