export type DrawerParamList = {
  Dashboard: undefined;
  PredictRisk: undefined;
  GlobeGis: undefined;
  Evacuation: undefined;
  HistoricalAtlas: undefined;
  ModelPerformance: undefined;
  AlertsReports: undefined;
  AiExplainer: undefined;
  About: undefined;
};

export interface NavItem {
  id: keyof DrawerParamList;
  label: string;
  icon: string; // lucide-react-native icon name
}

// Mirrors frontend/src/components/Sidebar.jsx's navItems exactly (id, label, order).
export const NAV_ITEMS: NavItem[] = [
  { id: 'Dashboard', label: 'Executive Dashboard', icon: 'Home' },
  { id: 'PredictRisk', label: 'Predict Risk Studio', icon: 'ZoomIn' },
  { id: 'GlobeGis', label: '3D World Globe & GIS', icon: 'Map' },
  { id: 'Evacuation', label: 'Offline Evacuation & Roads', icon: 'ShieldCheck' },
  { id: 'HistoricalAtlas', label: 'Historical Disaster Atlas', icon: 'Calendar' },
  { id: 'ModelPerformance', label: 'Model Performance Studio', icon: 'BarChart3' },
  { id: 'AlertsReports', label: 'Early Warning & Alerts', icon: 'Bell' },
  { id: 'AiExplainer', label: 'Explainable AI & SOPs', icon: 'Brain' },
  { id: 'About', label: 'System Architecture', icon: 'Info' }
];
