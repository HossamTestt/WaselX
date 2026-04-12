import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.bg,
    primary: Colors.blue,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
