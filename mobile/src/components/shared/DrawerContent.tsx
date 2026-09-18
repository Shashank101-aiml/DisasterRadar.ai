import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Home, ZoomIn, Map, ShieldCheck, Calendar, BarChart3, Bell, Brain, Info, CloudRain, Download, Server } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { NAV_ITEMS } from '../../navigation/types';

const ICONS: Record<string, React.ComponentType<any>> = {
  Home, ZoomIn, Map, ShieldCheck, Calendar, BarChart3, Bell, Brain, Info
};

export default function DrawerContent(props: DrawerContentComponentProps) {
  const activeRoute = props.state.routeNames[props.state.index];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.brandHeader}>
          <View style={styles.brandLogo}>
            <CloudRain size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              DisasterRadar<Text style={{ color: colors.accent }}>.ai</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Command Operating Center</Text>
          </View>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            const Icon = ICONS[item.icon] ?? Info;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => props.navigation.navigate(item.id)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <Icon size={18} color={isActive ? colors.accent : colors.textMuted} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadButton}>
          <Download size={15} color="#ffffff" />
          <Text style={styles.downloadLabel}>App Installed</Text>
        </TouchableOpacity>

        <View style={styles.missionBox}>
          <Text style={styles.missionTitle}>MISSION PROTOCOL</Text>
          <Text style={styles.missionText}>
            Ingesting real-time Open-Meteo & Copernicus telemetry with calibrated XGBoost (T*=0.55).
          </Text>
        </View>

        <View style={styles.devCredit}>
          <View style={styles.devIcon}>
            <Server size={15} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.devLabel}>Engine</Text>
            <Text style={styles.devTeam}>Disaster Intelligence Lab</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sidebar },
  brandHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border
  },
  brandLogo: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentDark,
    alignItems: 'center', justifyContent: 'center'
  },
  brandTitle: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  brandSubtitle: { fontSize: 10, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },
  nav: { padding: 10 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, marginVertical: 3,
    borderLeftWidth: 3, borderLeftColor: 'transparent'
  },
  navItemActive: { backgroundColor: '#111a2d', borderLeftColor: colors.accent },
  navLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  navLabelActive: { color: colors.accent, fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.accentDark, borderWidth: 1, borderColor: colors.accent,
    borderRadius: 6, paddingVertical: 10, marginBottom: 12
  },
  downloadLabel: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  missionBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 8, padding: 10
  },
  missionTitle: { fontSize: 11, color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontWeight: '700' },
  missionText: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  devCredit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  devIcon: {
    width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)', alignItems: 'center', justifyContent: 'center'
  },
  devLabel: { fontSize: 10, color: colors.textFaint },
  devTeam: { fontSize: 12, color: '#e2e8f0', fontWeight: '600' }
});
