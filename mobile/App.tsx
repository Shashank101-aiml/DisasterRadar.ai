import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import RootDrawer from './src/navigation/RootDrawer';
import { colors } from './src/constants/colors';
import { useDataStore } from './src/store/useDataStore';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.panel,
    primary: colors.accent,
    text: colors.text,
    border: colors.border
  }
};

export default function App() {
  const loadInitialData = useDataStore((s) => s.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={navTheme}>
        <RootDrawer />
      </NavigationContainer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
