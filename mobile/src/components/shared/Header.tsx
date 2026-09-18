import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { Menu, Clock, Bell, User } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export default function Header() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isNarrow = width < 420;
  const isVeryNarrow = width < 360;
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const statusBadge = (
    <View style={[styles.statusBadge, !isOnline && styles.statusBadgeOffline]}>
      <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.warningAlt }]} />
      <Text style={[styles.statusText, !isOnline && { color: '#fed7aa' }]}>
        {isOnline ? 'OPEN-METEO LIVE' : 'OFFLINE RESCUE MODE'}
      </Text>
    </View>
  );

  const clock = (
    <View style={styles.clock}>
      <Clock size={16} color={colors.accent} />
      <View>
        <Text style={styles.clockTime}>{time || '--:--:-- --'}</Text>
        <Text style={styles.clockDate}>{date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <View style={styles.left}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Menu size={20} color={colors.accent} />
          </TouchableOpacity>
          <View style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.title}>
                DisasterRadar<Text style={{ color: colors.accent }}>.ai</Text>
              </Text>
              {!isVeryNarrow && (
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>EOC-v2.5</Text>
                </View>
              )}
            </View>
            {!isNarrow && <Text style={styles.subtitle}>AI Flood Risk Prediction & Disaster Intelligence</Text>}
          </View>
        </View>

        <View style={styles.right}>
          {!isNarrow && statusBadge}
          {!isNarrow && clock}

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AlertsReports' as never)}>
            <Bell size={18} color="#e2e8f0" />
            <View style={styles.badgeDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('About' as never)}>
            <User size={18} color="#e2e8f0" />
          </TouchableOpacity>
        </View>
      </View>

      {isNarrow && (
        <View style={styles.secondaryRow}>
          {statusBadge}
          {clock}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: 'rgba(8, 12, 22, 0.95)', borderBottomWidth: 1, borderBottomColor: colors.borderAccent
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10
  },
  secondaryRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingBottom: 10, gap: 10
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  menuBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8, padding: 6
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  versionBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2
  },
  versionText: { fontSize: 9, fontWeight: '700', color: colors.accent, letterSpacing: 0.5 },
  subtitle: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4
  },
  statusBadgeOffline: { backgroundColor: 'rgba(124, 45, 18, 0.75)', borderColor: colors.warningAlt },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, color: '#cbd5e1', fontWeight: '700' },
  clock: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clockTime: { fontSize: 12, fontWeight: '700', color: colors.text },
  clockDate: { fontSize: 9, color: colors.textFaint },
  iconBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 6, position: 'relative'
  },
  badgeDot: {
    position: 'absolute', top: 3, right: 3, width: 6, height: 6,
    backgroundColor: colors.danger, borderRadius: 3
  }
});
