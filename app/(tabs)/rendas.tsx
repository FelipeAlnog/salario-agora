import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/colors';
import { useRendas } from '../../hooks/useRendas';
import { useSettings } from '../../hooks/useSettings';
import { useCounter } from '../../hooks/useCounter';
import { RendaCard } from '../../components/RendaCard';
import { RendaForm } from '../../components/RendaForm';
import { Renda, calcularGanhoHoje } from '../../utils/calculations';

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function RendasScreen() {
  const { rendas, adicionarRenda, editarRenda, removerRenda, toggleAtiva } = useRendas();
  const { modo } = useSettings();
  const counter = useCounter(rendas, modo);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [rendaEditando, setRendaEditando] = useState<Renda | undefined>(undefined);

  const abrirNova = () => {
    setRendaEditando(undefined);
    setModalVisivel(true);
  };

  const abrirEditar = (renda: Renda) => {
    setRendaEditando(renda);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setRendaEditando(undefined);
  };

  const handleSalvar = (renda: Renda) => {
    if (rendaEditando) {
      editarRenda(renda);
    } else {
      adicionarRenda({ ...renda, id: gerarId() });
    }
    fecharModal();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Rendas</Text>
            <Text style={styles.headerSub}>
              {rendas.length} fonte{rendas.length !== 1 ? 's' : ''} cadastrada{rendas.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={abrirNova}>
            <Text style={styles.addBtnText}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {rendas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💼</Text>
            <Text style={styles.emptyTitle}>Nenhuma renda ainda</Text>
            <Text style={styles.emptySub}>
              Adicione sua primeira fonte de renda para começar a monitorar seus ganhos em tempo real.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={abrirNova}>
              <Text style={styles.emptyBtnText}>Adicionar renda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rendas.map((renda) => {
            const ganhoHoje = calcularGanhoHoje(renda, modo);
            return (
              <RendaCard
                key={renda.id}
                renda={renda}
                modo={modo}
                ganhoHoje={ganhoHoje}
                onEdit={() => abrirEditar(renda)}
                onDelete={() => removerRenda(renda.id)}
                onToggle={() => toggleAtiva(renda.id)}
              />
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={fecharModal}
      >
        <RendaForm
          inicial={rendaEditando}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
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
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
