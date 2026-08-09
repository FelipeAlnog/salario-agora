import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/colors';
import { useRendas } from '../../hooks/useRendas';
import { useCounter } from '../../hooks/useCounter';
import { useSettings } from '../../hooks/useSettings';
import { CounterDisplay } from '../../components/CounterDisplay';
import { ProgressBar } from '../../components/ProgressBar';
import {
  calcularProgressoDia,
  calcularValorPorSegundo,
  calcularGanhoHoje,
  calcularGanhoSemana,
  calcularGanhoMes,
  calcularGanhoAno,
} from '../../utils/calculations';
import { formatarMoeda, formatarHorario, formatarPorcentagem } from '../../utils/formatting';

export default function DashboardScreen() {
  const { rendas } = useRendas();
  const { modo, setModo } = useSettings();
  const counter = useCounter(rendas, modo);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const rendasAtivas = rendas.filter((r) => r.ativa);
  const primeiraRenda = rendasAtivas[0];
  const progresso = primeiraRenda ? calcularProgressoDia(primeiraRenda) : 0;

  const diaSemana = agora.getDay();
  const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Salário Agora</Text>
          <Text style={styles.headerSub}>
            {formatarHorario(agora)} · {agora.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, modo === 'trabalhado' && styles.modeBtnAtivo]}
            onPress={() => setModo('trabalhado')}
          >
            <Text style={[styles.modeBtnText, modo === 'trabalhado' && styles.modeBtnTextAtivo]}>
              Tempo Trabalhado
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, modo === 'corrido' && styles.modeBtnAtivo]}
            onPress={() => setModo('corrido')}
          >
            <Text style={[styles.modeBtnText, modo === 'corrido' && styles.modeBtnTextAtivo]}>
              Tempo Corrido
            </Text>
          </TouchableOpacity>
        </View>

        {rendasAtivas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💼</Text>
            <Text style={styles.emptyTitle}>Nenhuma renda cadastrada</Text>
            <Text style={styles.emptySub}>
              Vá até a aba "Rendas" para adicionar sua fonte de renda e começar a acompanhar seus ganhos em tempo real.
            </Text>
          </View>
        ) : (
          <>
            {/* Main counter — Hoje */}
            <View style={styles.mainCounter}>
              <Text style={styles.mainCounterLabel}>GANHO HOJE</Text>
              <CounterDisplay valor={counter.ganhoHoje} tamanho="grande" />
              {modo === 'trabalhado' && !isDiaUtil && (
                <Text style={styles.weekendNote}>🌴 Final de semana — descansando!</Text>
              )}
            </View>

            {/* Desde o início do período */}
            <View style={styles.inicioCounter}>
              <Text style={styles.inicioLabel}>
                DESDE O DIA {counter.diaInicioEfetivo}
              </Text>
              <CounterDisplay valor={counter.ganhoDesdeInicio} tamanho="medio" />
              <Text style={styles.inicioSub}>
                acumulado neste período
              </Text>
            </View>

            {/* Rate cards */}
            <View style={styles.rateGrid}>
              <View style={styles.rateCard}>
                <Text style={styles.rateLabel}>Por segundo</Text>
                <Text style={styles.rateValue}>{formatarMoeda(counter.vps)}</Text>
              </View>
              <View style={styles.rateCard}>
                <Text style={styles.rateLabel}>Por minuto</Text>
                <Text style={styles.rateValue}>{formatarMoeda(counter.vpm)}</Text>
              </View>
              <View style={styles.rateCard}>
                <Text style={styles.rateLabel}>Por hora</Text>
                <Text style={styles.rateValue}>{formatarMoeda(counter.vph)}</Text>
              </View>
              <View style={styles.rateCard}>
                <Text style={styles.rateLabel}>Por dia</Text>
                <Text style={styles.rateValue}>{formatarMoeda(counter.vpd)}</Text>
              </View>
            </View>

            {/* Progress bar */}
            {modo === 'trabalhado' && primeiraRenda && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progresso={progresso}
                  label={`${formatarHorario(agora)} — ${formatarPorcentagem(progresso)} do expediente`}
                />
              </View>
            )}

            {/* Totals */}
            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Resumo</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Hoje</Text>
                <Text style={styles.totalValue}>{formatarMoeda(counter.ganhoHoje)}</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Esta semana</Text>
                <Text style={styles.totalValue}>{formatarMoeda(counter.ganhoSemana)}</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Este mês</Text>
                <Text style={styles.totalValue}>{formatarMoeda(counter.ganhoMes)}</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Este ano</Text>
                <Text style={[styles.totalValue, styles.totalValueAno]}>
                  {formatarMoeda(counter.ganhoAno)}
                </Text>
              </View>
              {counter.ganhoDesdeEmprego > 0 && (
                <>
                  <View style={styles.totalDivider} />
                  <View style={styles.totalRow}>
                    <View>
                      <Text style={styles.totalLabel}>Desde a admissão</Text>
                      <Text style={styles.totalLabelSub}>
                        {rendasAtivas.find(r => r.dataAdmissao)?.dataAdmissao}
                      </Text>
                    </View>
                    <Text style={[styles.totalValue, styles.totalValueAdmissao]}>
                      {formatarMoeda(counter.ganhoDesdeEmprego)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Per-renda breakdown if multiple */}
            {rendasAtivas.length > 1 && (
              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Por fonte de renda</Text>
                {rendasAtivas.map((renda) => {
                  const vps = calcularValorPorSegundo(renda, modo);
                  const ganhoHoje = calcularGanhoHoje(renda, modo);
                  const ganhoMes = calcularGanhoMes(renda, modo);
                  return (
                    <View key={renda.id} style={styles.breakdownCard}>
                      <View style={styles.breakdownHeader}>
                        <Text style={styles.breakdownNome}>{renda.nome}</Text>
                        <View style={[styles.badge, renda.tipo === 'CLT' ? styles.badgeCLT : styles.badgePJ]}>
                          <Text style={styles.badgeText}>{renda.tipo}</Text>
                        </View>
                      </View>
                      <View style={styles.breakdownValues}>
                        <View>
                          <Text style={styles.breakdownValLabel}>Hoje</Text>
                          <Text style={styles.breakdownVal}>{formatarMoeda(ganhoHoje)}</Text>
                        </View>
                        <View>
                          <Text style={styles.breakdownValLabel}>Este mês</Text>
                          <Text style={styles.breakdownVal}>{formatarMoeda(ganhoMes)}</Text>
                        </View>
                        <View>
                          <Text style={styles.breakdownValLabel}>Por hora</Text>
                          <Text style={styles.breakdownVal}>{formatarMoeda(vps * 3600)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
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
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mainCounter: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.greenDim,
  },
  mainCounterLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  weekendNote: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  inicioCounter: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inicioLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inicioSub: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 8,
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  rateCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  progressSection: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalsTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  totalValueAno: {
    color: Colors.green,
    fontSize: FontSizes.lg,
  },
  totalLabelSub: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  totalValueAdmissao: {
    color: Colors.green,
    fontSize: FontSizes.lg,
  },
  breakdownSection: {
    marginBottom: Spacing.md,
  },
  breakdownTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  breakdownNome: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCLT: { backgroundColor: '#1565C030' },
  badgePJ: { backgroundColor: '#E6510030' },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  breakdownValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownValLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  breakdownVal: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.green,
    fontVariant: ['tabular-nums'],
  },
});
