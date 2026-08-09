import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Colors, FontSizes } from '../constants/colors';
import { formatarMoeda } from '../utils/formatting';

interface Props {
  valor: number;
  label?: string;
  tamanho?: 'grande' | 'medio' | 'pequeno';
}

export function CounterDisplay({ valor, label, tamanho = 'grande' }: Props) {
  const animatedValue = useRef(new Animated.Value(valor)).current;
  const displayValue = useRef(valor);
  const [displayStr, setDisplayStr] = React.useState(formatarMoeda(valor));

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      displayValue.current = value;
      setDisplayStr(formatarMoeda(value));
    });

    Animated.spring(animatedValue, {
      toValue: valor,
      useNativeDriver: false,
      speed: 50,
      bounciness: 0,
    }).start();

    return () => animatedValue.removeListener(listener);
  }, [valor, animatedValue]);

  const fontSize =
    tamanho === 'grande'
      ? FontSizes.counter
      : tamanho === 'medio'
      ? FontSizes.xxl
      : FontSizes.xl;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={[styles.counter, { fontSize }]}>{displayStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counter: {
    fontFamily: undefined, // monospace fallback via fontVariant
    fontVariant: ['tabular-nums'],
    color: Colors.green,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
