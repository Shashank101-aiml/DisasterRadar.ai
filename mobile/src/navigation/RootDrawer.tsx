import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from '../components/shared/DrawerContent';
import Header from '../components/shared/Header';
import { colors } from '../constants/colors';

import DashboardScreen from '../screens/DashboardScreen';
import PredictRiskScreen from '../screens/PredictRiskScreen';
import GlobeGisScreen from '../screens/GlobeGisScreen';
import EvacuationScreen from '../screens/EvacuationScreen';
import HistoricalAtlasScreen from '../screens/HistoricalAtlasScreen';
import ModelPerformanceScreen from '../screens/ModelPerformanceScreen';
import AlertsReportsScreen from '../screens/AlertsReportsScreen';
import AiExplainerScreen from '../screens/AiExplainerScreen';
import AboutScreen from '../screens/AboutScreen';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function RootDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        header: () => <Header />,
        drawerType: 'front',
        sceneStyle: { backgroundColor: colors.background },
        drawerStyle: { width: 280 }
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="PredictRisk" component={PredictRiskScreen} />
      <Drawer.Screen name="GlobeGis" component={GlobeGisScreen} />
      <Drawer.Screen name="Evacuation" component={EvacuationScreen} />
      <Drawer.Screen name="HistoricalAtlas" component={HistoricalAtlasScreen} />
      <Drawer.Screen name="ModelPerformance" component={ModelPerformanceScreen} />
      <Drawer.Screen name="AlertsReports" component={AlertsReportsScreen} />
      <Drawer.Screen name="AiExplainer" component={AiExplainerScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}
