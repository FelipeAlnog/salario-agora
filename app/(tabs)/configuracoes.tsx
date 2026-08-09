import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/colors';
import { useSettings } from '../../hooks/useSettings';
import { useRendas } from '../../hooks/useRendas';
import { resetarTodosDados } from '../../utils/storage';

export default function ConfiguracoesScreen() {
  const { modo, setModo, tema, setTema } = useSettings();
  const { resetarRendas } = useRendas();

  const handleResetar = () => {
    Alert.alert(
      'Resetar todos os dados',
      'Isso apagará todas as rendas e configurações. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            await resetarTodosDados();
            resetarRendas();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        {/* Modo de cálculo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de cálculo</Text>
          <Text style={styles.sectionDesc}>
            Define como o contador avança ao longo do tempo.
          </Text>

          <TouchableOpacity
            style={[styles.optionCard, modo === 'trabalhado' && styles.optionCardAtivo]}
            onPress={() => setModo('trabalhado')}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionEmoji}>⏰</Text>
              <View style={styles.optionTextBlock}>
                <Text style={styles.optionTitle}>Tempo Trabalhado</Text>
                <Text style={styles.optionSub}>
                  Conta apenas durante o expediente (dias úteis + horário configurado)
                </Text>
              </View>
              <View style={[styles.radio, modo === 'trabalhado' && styles.radioAtivo]}>
                {modo === 'trabalhado' && <View style={styles.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, modo === 'corrido' && styles.optionCardAtivo]}
            onPress={() => setModo('corrido')}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionEmoji}>🕐</Text>
              <View style={styles.optionTextBlock}>
                <Text style={styles.optionTitle}>Tempo Corrido</Text>
                <Text style={styles.optionSub}>
                  Divide o salário por todos os segundos do mês, conta 24/7
                </Text>
              </View>
              <View style={[styles.radio, modo === 'corrido' && styles.radioAtivo]}>
                {modo === 'corrido' && <View style={styles.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Text style={styles.switchEmoji}>{tema === 'dark' ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={styles.switchTitle}>Tema escuro</Text>
                <Text style={styles.switchSub}>
                  {tema === 'dark' ? 'Ativo — modo noturno' : 'Desativado — modo claro'}
                </Text>
              </View>
            </View>
            <Switch
              value={tema === 'dark'}
              onValueChange={(v) => setTema(v ? 'dark' : 'light')}
              trackColor={{ false: Colors.border, true: Colors.greenMuted }}
              thumbColor={tema === 'dark' ? Colors.green : Colors.textMuted}
            />
          </View>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>INSS</Text>
              <Text style={styles.infoValue}>Tabela 2024</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IRRF</Text>
              <Text style={styles.infoValue}>Simplificado 2024</Text>
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ Os cálculos de INSS e IRRF são aproximações educativas. Consulte um contador para informações precisas.
            </Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleResetar}>
            <Text style={styles.dangerBtnText}>🗑 Resetar todos os dados</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  sectionDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCardAtivo: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenDim,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTextBlock: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: {
    borderColor: Colors.green,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  switchRow: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchEmoji: {
    fontSize: 24,
  },
  switchTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchSub: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  infoLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 10,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  disclaimerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dangerBtn: {
    backgroundColor: Colors.error + '20',
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error + '50',
  },
  dangerBtnText: {
    fontSize: FontSizes.md,
    color: Colors.error,
    fontWeight: '700',
  },
});
