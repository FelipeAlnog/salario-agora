import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants/colors';
import { Renda, ModoCalculo, calcularValorPorSegundo, calcularSalarioLiquido } from '../utils/calculations';
import { formatarMoeda } from '../utils/formatting';

interface Props {
  renda: Renda;
  modo: ModoCalculo;
  ganhoHoje: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function RendaCard({ renda, modo, ganhoHoje, onEdit, onDelete, onToggle }: Props) {
  const vps = calcularValorPorSegundo(renda, modo);
  const liquido = calcularSalarioLiquido(renda);

  const handleDelete = () => {
    Alert.alert(
      'Remover renda',
      `Tem certeza que deseja remover "${renda.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={[styles.card, !renda.ativa && styles.cardInativa]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nome}>{renda.nome}</Text>
          <View style={[styles.badge, renda.tipo === 'CLT' ? styles.badgeCLT : styles.badgePJ]}>
            <Text style={styles.badgeText}>{renda.tipo}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onToggle} style={styles.toggleBtn}>
          <View style={[styles.toggle, renda.ativa && styles.toggleAtivo]}>
            <View style={[styles.toggleKnob, renda.ativa && styles.toggleKnobAtivo]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.valores}>
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Bruto</Text>
          <Text style={styles.valorText}>{formatarMoeda(renda.salarioBruto)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Líquido</Text>
          <Text style={[styles.valorText, styles.valorLiquido]}>{formatarMoeda(liquido)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Hoje</Text>
          <Text style={[styles.valorText, styles.valorHoje]}>{formatarMoeda(ganhoHoje)}</Text>
        </View>
      </View>

      <View style={styles.rate}>
        <Text style={styles.rateText}>
          {formatarMoeda(vps)}/s · {formatarMoeda(vps * 60)}/min · {formatarMoeda(vps * 3600)}/h
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, styles.deleteBtn]}>
          <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInativa: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nome: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCLT: {
    backgroundColor: '#1565C030',
  },
  badgePJ: {
    backgroundColor: '#E65100' + '30',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  toggleBtn: {
    padding: 4,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleAtivo: {
    backgroundColor: Colors.greenDim,
    borderColor: Colors.green,
    borderWidth: 1,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textMuted,
  },
  toggleKnobAtivo: {
    backgroundColor: Colors.green,
    alignSelf: 'flex-end',
  },
  valores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  valorItem: {
    flex: 1,
    alignItems: 'center',
  },
  valorLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  valorText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  valorLiquido: {
    color: Colors.textPrimary,
  },
  valorHoje: {
    color: Colors.green,
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  rate: {
    marginBottom: Spacing.sm,
  },
  rateText: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: Colors.error + '20',
  },
  actionBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deleteBtnText: {
    color: Colors.error,
  },
});
