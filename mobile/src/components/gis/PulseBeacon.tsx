import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { colors } from '../../constants/colors';

/**
 * A lightweight animated pulse-ring, standing in for the web app's 3D
 * "holographic beacon" (a WebGL pulsing ring + rotating crystal over the
 * globe) — see the mobile port plan's risk callout on why the full WebGL
 * globe was dropped in favor of this simpler, native-friendly marker.
 */
export default function PulseBeacon({ color = colors.accent }: { color?: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true })
      ])
    );
    scale.setValue(0);
    opacity.setValue(0.8);
    loop.start();
    return () => loop.stop();
  }, [scale, opacity]);

  const ringScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.4] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, { borderColor: color, opacity, transform: [{ scale: ringScale }] }]} />
      <View style={[styles.core, { backgroundColor: color }]} />
    </View>
  );
}

const SIZE = 26;

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 2
  },
  core: {
    width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff'
  }
});
