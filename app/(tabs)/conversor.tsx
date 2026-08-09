import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/colors';
import { useRendas } from '../../hooks/useRendas';
import { useSettings } from '../../hooks/useSettings';
import {
  calcularValorPorSegundo,
  calcularTempoParaValor,
} from '../../utils/calculations';
import { formatarMoeda, formatarTempo } from '../../utils/formatting';

interface Preset {
  emoji: string;
  label: string;
  valor: number;
}

const PRESETS: Preset[] = [
  { emoji: '☕', label: 'Cafezinho', valor: 8 },
  { emoji: '🍽', label: 'Almoço', valor: 45 },
  { emoji: '🚗', label: 'Uber', valor: 25 },
  { emoji: '🎬', label: 'Streaming/mês', valor: 37.9 },
  { emoji: '✈️', label: 'Passagem aérea', valor: 600 },
  { emoji: '📱', label: 'Smartphone', valor: 2500 },
];

export default function ConversorScreen() {
  const { rendas } = useRendas();
  const { modo } = useSettings();

  const [inputMode, setInputMode] = useState<'tempo' | 'valor'>('tempo');
  const [horas, setHoras] = useState('');
  const [minutos, setMinutos] = useState('');
  const [valorInput, setValorInput] = useState('');

  const rendasAtivas = rendas.filter((r) => r.ativa);
  const totalVps = rendasAtivas.reduce(
    (acc, r) => acc + calcularValorPorSegundo(r, modo),
    0
  );

  // Tempo → Valor
  const horasNum = parseInt(horas || '0', 10) || 0;
  const minutosNum = parseInt(minutos || '0', 10) || 0;
  const totalSegundos = horasNum * 3600 + minutosNum * 60;
  const valorCalculado = totalVps * totalSegundos;

  // Valor → Tempo
  const valorNum = parseFloat((valorInput || '0').replace(',', '.')) || 0;
  const tempoCalculado = calcularTempoParaValor(valorNum, totalVps);

  const aplicarPreset = (preset: Preset) => {
    setInputMode('valor');
    setValorInput(preset.valor.toFixed(2).replace('.', ','));
  };

  const semRenda = rendasAtivas.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversor</Text>
          <Text style={styles.headerSub}>
            Quanto vale seu tempo?
          </Text>
        </View>

        {semRenda ? (
          <View style={styles.semRenda}>
            <Text style={styles.semRendaEmoji}>⏱</Text>
            <Text style={styles.semRendaText}>
              Cadastre uma renda para usar o conversor de tempo.
            </Text>
          </View>
        ) : (
          <>
            {/* Rate info */}
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>Sua taxa atual</Text>
              <Text style={styles.rateValue}>{formatarMoeda(totalVps * 3600)}/hora</Text>
              <Text style={styles.rateSub}>
                {formatarMoeda(totalVps)}/segundo · {formatarMoeda(totalVps * 60)}/minuto
              </Text>
            </View>

            {/* Toggle input mode */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, inputMode === 'tempo' && styles.modeBtnAtivo]}
                onPress={() => setInputMode('tempo')}
              >
                <Text style={[styles.modeBtnText, inputMode === 'tempo' && styles.modeBtnTextAtivo]}>
                  Tempo → R$
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, inputMode === 'valor' && styles.modeBtnAtivo]}
                onPress={() => setInputMode('valor')}
              >
                <Text style={[styles.modeBtnText, inputMode === 'valor' && styles.modeBtnTextAtivo]}>
                  R$ → Tempo
                </Text>
              </TouchableOpacity>
            </View>

            {inputMode === 'tempo' ? (
              <View style={styles.inputSection}>
                <Text style={styles.inputSectionTitle}>Informe a duração</Text>
                <View style={styles.tempoInputRow}>
                  <View style={styles.tempoField}>
                    <TextInput
                      style={styles.tempoInput}
                      value={horas}
                      onChangeText={setHoras}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                    />
                    <Text style={styles.tempoUnit}>h</Text>
                  </View>
                  <Text style={styles.tempoSep}>:</Text>
                  <View style={styles.tempoField}>
                    <TextInput
                      style={styles.tempoInput}
                      value={minutos}
                      onChangeText={setMinutos}
                      keyboardType="number-pad"
                      placeholder="00"
                      placeholderTextColor={Colors.textMuted}
                    />
                    <Text style={styles.tempoUnit}>min</Text>
                  </View>
                </View>

                {totalSegundos > 0 && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Esta reunião/tarefa vale</Text>
                    <Text style={styles.resultValue}>{formatarMoeda(valorCalculado)}</Text>
                    <Text style={styles.resultSub}>
                      {formatarTempo(horasNum, minutosNum)} = {formatarMoeda(valorCalculado)} do seu tempo
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.inputSection}>
                <Text style={styles.inputSectionTitle}>Informe o valor (R$)</Text>
                <View style={styles.valorInputRow}>
                  <Text style={styles.valorPrefix}>R$</Text>
                  <TextInput
                    style={styles.valorInput}
                    value={valorInput}
                    onChangeText={setValorInput}
                    keyboardType="numeric"
                    placeholder="0,00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                {valorNum > 0 && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Tempo necessário para ganhar</Text>
                    <Text style={styles.resultValue}>
                      {formatarTempo(
                        tempoCalculado.horas,
                        tempoCalculado.minutos,
                        tempoCalculado.segundos
                      )}
                    </Text>
                    <Text style={styles.resultSub}>
                      {formatarMoeda(valorNum)} = {formatarTempo(tempoCalculado.horas, tempoCalculado.minutos, tempoCalculado.segundos)} de trabalho
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Presets */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsTitle}>Presets rápidos</Text>
              <View style={styles.presetsGrid}>
                {PRESETS.map((preset) => {
                  const t = calcularTempoParaValor(preset.valor, totalVps);
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={styles.presetCard}
                      onPress={() => aplicarPreset(preset)}
                    >
                      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                      <Text style={styles.presetLabel}>{preset.label}</Text>
                      <Text style={styles.presetValor}>{formatarMoeda(preset.valor)}</Text>
                      <Text style={styles.presetTempo}>
                        = {formatarTempo(t.horas, t.minutos, t.segundos)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  semRenda: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  semRendaEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  semRendaText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rateCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.greenDim,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.green,
    fontVariant: ['tabular-nums'],
  },
  rateSub: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnAtivo: {
    backgroundColor: Colors.greenDim,
  },
  modeBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modeBtnTextAtivo: {
    color: Colors.green,
  },
  inputSection: {
    marginBottom: Spacing.md,
  },
  inputSectionTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  tempoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tempoField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempoInput: {
    flex: 1,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 12,
  },
  tempoUnit: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 30,
  },
  tempoSep: {
    fontSize: FontSizes.xxl,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  valorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  valorPrefix: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  valorInput: {
    flex: 1,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  resultCard: {
    backgroundColor: Colors.greenDim,
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.green,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: FontSizes.sm,
    color: Colors.green,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.green,
    fontVariant: ['tabular-nums'],
  },
  resultSub: {
    fontSize: FontSizes.sm,
    color: Colors.greenMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  presetsSection: {
    marginBottom: Spacing.md,
  },
  presetsTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    width: '47%',
  },
  presetEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  presetValor: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  presetTempo: {
    fontSize: FontSizes.sm,
    color: Colors.green,
    fontWeight: '700',
  },
});
