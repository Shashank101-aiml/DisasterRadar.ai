import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface Props {
  title: string;
  phase: string;
  description: string;
}

/** Confirms drawer routing works end-to-end; replaced screen-by-screen in later phases. */
export default function PlaceholderScreen({ title, phase, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.phase}>{phase}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  phase: { fontSize: 12, fontWeight: '700', color: colors.accent, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 13, color: colors.textMuted, marginTop: 12, textAlign: 'center', lineHeight: 19 }
});
