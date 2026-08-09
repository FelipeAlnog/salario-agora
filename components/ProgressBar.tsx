import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../constants/colors';

interface Props {
  progresso: number; // 0 to 1
  label?: string;
}

export function ProgressBar({ progresso, label }: Props) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progresso,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progresso, widthAnim]);

  const percentStr = `${Math.round(progresso * 100)}%`;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.percent}>{percentStr}</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  percent: {
    fontSize: FontSizes.sm,
    color: Colors.green,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
});
