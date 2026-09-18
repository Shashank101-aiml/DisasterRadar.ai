import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function InfoBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.icon}><Text style={styles.iconText}>i</Text></View>
      <Text style={styles.text}>
        This is a data-driven system. Predictions are based on historical data and model learning and should be
        used for decision support, not as the sole source.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.panelAlt,
    borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 12, marginTop: 16
  },
  icon: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accentDark,
    alignItems: 'center', justifyContent: 'center', marginTop: 1
  },
  iconText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  text: { flex: 1, fontSize: 11, color: colors.textMuted, lineHeight: 16 }
});
