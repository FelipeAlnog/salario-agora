import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants/colors';
import { Renda, calcularSalarioLiquido, calcularDetalheCLT } from '../utils/calculations';
import { formatarMoeda } from '../utils/formatting';

interface Props {
  inicial?: Partial<Renda>;
  onSalvar: (renda: Renda) => void;
  onCancelar: () => void;
}

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function RendaForm({ inicial, onSalvar, onCancelar }: Props) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [tipo, setTipo] = useState<'CLT' | 'PJ'>(inicial?.tipo ?? 'CLT');
  const [salarioBruto, setSalarioBruto] = useState(
    inicial?.salarioBruto?.toString() ?? ''
  );
  const [diasUteis, setDiasUteis] = useState(
    (inicial?.diasUteis ?? 22).toString()
  );
  const [horasPorDia, setHorasPorDia] = useState(
    (inicial?.horasPorDia ?? 8).toString()
  );
  const [horarioInicio, setHorarioInicio] = useState(
    inicial?.horarioInicio ?? '08:00'
  );
  const [horarioFim, setHorarioFim] = useState(
    inicial?.horarioFim ?? '17:00'
  );
  const [descontarINSS, setDescontarINSS] = useState(
    inicial?.descontarINSS ?? true
  );
  const [descontarIRRF, setDescontarIRRF] = useState(
    inicial?.descontarIRRF ?? true
  );
  const [impostoPercent, setImpostoPercent] = useState(
    (inicial?.impostoPercent ?? 0).toString()
  );
  const [outrosCustos, setOutrosCustos] = useState(
    (inicial?.outrosCustos ?? 0).toString()
  );
  const [baseMes, setBaseMes] = useState<'diasUteis' | 'mesCompleto'>(
    inicial?.baseMes ?? 'diasUteis'
  );
  const [diaInicio, setDiaInicio] = useState(
    (inicial?.diaInicio ?? 1).toString()
  );
  const [dataAdmissao, setDataAdmissao] = useState(
    inicial?.dataAdmissao ?? ''
  );
  const [erro, setErro] = useState('');

  const bruto = parseFloat(salarioBruto.replace(',', '.')) || 0;

  const rendaPreview: Renda = {
    id: inicial?.id ?? gerarId(),
    nome: nome || 'Renda',
    tipo,
    salarioBruto: bruto,
    diasUteis: parseInt(diasUteis) || 22,
    horasPorDia: parseInt(horasPorDia) || 8,
    horarioInicio,
    horarioFim,
    ativa: inicial?.ativa ?? true,
    baseMes,
    diaInicio: parseInt(diaInicio) || 1,
    dataAdmissao: dataAdmissao.trim() || undefined,
    descontarINSS,
    descontarIRRF,
    impostoPercent: parseFloat(impostoPercent.replace(',', '.')) || 0,
    outrosCustos: parseFloat(outrosCustos.replace(',', '.')) || 0,
  };

  const liquido = calcularSalarioLiquido(rendaPreview);
  const detalheCLT = tipo === 'CLT' ? calcularDetalheCLT(bruto) : null;

  const handleSalvar = () => {
    if (!nome.trim()) {
      setErro('Informe um nome para a renda.');
      return;
    }
    if (bruto <= 0) {
      setErro('Informe um salário bruto válido.');
      return;
    }
    setErro('');
    onSalvar({ ...rendaPreview, nome: nome.trim() });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>
        {inicial?.id ? 'Editar Renda' : 'Nova Renda'}
      </Text>

      {/* Tipo */}
      <View style={styles.tipoRow}>
        <TouchableOpacity
          style={[styles.tipoBtn, tipo === 'CLT' && styles.tipoBtnAtivo]}
          onPress={() => setTipo('CLT')}
        >
          <Text style={[styles.tipoBtnText, tipo === 'CLT' && styles.tipoBtnTextAtivo]}>
            CLT
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoBtn, tipo === 'PJ' && styles.tipoBtnAtivo]}
          onPress={() => setTipo('PJ')}
        >
          <Text style={[styles.tipoBtnText, tipo === 'PJ' && styles.tipoBtnTextAtivo]}>
            PJ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nome */}
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Emprego principal"
        placeholderTextColor={Colors.textMuted}
      />

      {/* Salário Bruto */}
      <Text style={styles.label}>Salário Bruto (R$)</Text>
      <TextInput
        style={styles.input}
        value={salarioBruto}
        onChangeText={setSalarioBruto}
        keyboardType="numeric"
        placeholder="5000,00"
        placeholderTextColor={Colors.textMuted}
      />

      {/* Dias úteis e Horas por dia */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Dias úteis/mês</Text>
          <TextInput
            style={styles.input}
            value={diasUteis}
            onChangeText={setDiasUteis}
            keyboardType="numeric"
            placeholder="22"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Horas/dia</Text>
          <TextInput
            style={styles.input}
            value={horasPorDia}
            onChangeText={setHorasPorDia}
            keyboardType="numeric"
            placeholder="8"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {/* Base de cálculo */}
      <Text style={styles.label}>Base de cálculo do salário</Text>
      <View style={styles.tipoRow}>
        <TouchableOpacity
          style={[styles.tipoBtn, baseMes === 'diasUteis' && styles.tipoBtnAtivo]}
          onPress={() => setBaseMes('diasUteis')}
        >
          <Text style={[styles.tipoBtnText, baseMes === 'diasUteis' && styles.tipoBtnTextAtivo]}>
            Dias Úteis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoBtn, baseMes === 'mesCompleto' && styles.tipoBtnAtivo]}
          onPress={() => setBaseMes('mesCompleto')}
        >
          <Text style={[styles.tipoBtnText, baseMes === 'mesCompleto' && styles.tipoBtnTextAtivo]}>
            Mês Cheio (30 dias)
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        {baseMes === 'diasUteis'
          ? `Divide o salário por ${parseInt(diasUteis) || 22} dias úteis × ${parseInt(horasPorDia) || 8}h = ${(parseInt(diasUteis) || 22) * (parseInt(horasPorDia) || 8)}h/mês`
          : `Divide o salário por 30 dias × ${parseInt(horasPorDia) || 8}h = ${30 * (parseInt(horasPorDia) || 8)}h/mês`}
      </Text>

      {/* Horários */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Início do expediente</Text>
          <TextInput
            style={styles.input}
            value={horarioInicio}
            onChangeText={setHorarioInicio}
            placeholder="08:00"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Fim do expediente</Text>
          <TextInput
            style={styles.input}
            value={horarioFim}
            onChangeText={setHorarioFim}
            placeholder="17:00"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {/* Dia de início */}
      <Text style={styles.label}>Dia de início da contagem</Text>
      <TextInput
        style={styles.input}
        value={diaInicio}
        onChangeText={(v) => {
          const n = parseInt(v) || 1;
          setDiaInicio(String(Math.min(31, Math.max(1, n))));
        }}
        keyboardType="numeric"
        placeholder="1"
        placeholderTextColor={Colors.textMuted}
      />
      <Text style={styles.hint}>
        Dia do mês em que seu salário começa a ser contado (ex: dia 5 = conta do dia 5 ao dia 4 do próximo mês)
      </Text>

      {/* Data de admissão */}
      <Text style={styles.label}>Data de admissão (opcional)</Text>
      <TextInput
        style={styles.input}
        value={dataAdmissao}
        onChangeText={(v) => {
          // Auto-formata DD/MM/AAAA enquanto digita
          const nums = v.replace(/\D/g, '').slice(0, 8);
          let formatted = nums;
          if (nums.length > 2) formatted = nums.slice(0, 2) + '/' + nums.slice(2);
          if (nums.length > 4) formatted = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4);
          setDataAdmissao(formatted);
        }}
        keyboardType="numeric"
        placeholder="DD/MM/AAAA"
        placeholderTextColor={Colors.textMuted}
        maxLength={10}
      />
      <Text style={styles.hint}>
        Usado para calcular o total ganho desde que começou nesta renda
      </Text>

      {/* CLT options */}
      {tipo === 'CLT' && (
        <>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Descontar INSS</Text>
            <Switch
              value={descontarINSS}
              onValueChange={setDescontarINSS}
              trackColor={{ false: Colors.border, true: Colors.greenMuted }}
              thumbColor={descontarINSS ? Colors.green : Colors.textMuted}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Descontar IRRF</Text>
            <Switch
              value={descontarIRRF}
              onValueChange={setDescontarIRRF}
              trackColor={{ false: Colors.border, true: Colors.greenMuted }}
              thumbColor={descontarIRRF ? Colors.green : Colors.textMuted}
            />
          </View>
          {detalheCLT && bruto > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Estimativa mensal</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Bruto</Text>
                <Text style={styles.previewValue}>{formatarMoeda(bruto)}</Text>
              </View>
              {descontarINSS && (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>- INSS</Text>
                  <Text style={styles.previewValueNeg}>
                    -{formatarMoeda(detalheCLT.inss)}
                  </Text>
                </View>
              )}
              {descontarIRRF && (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>- IRRF</Text>
                  <Text style={styles.previewValueNeg}>
                    -{formatarMoeda(detalheCLT.irrf)}
                  </Text>
                </View>
              )}
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={styles.previewLabelTotal}>Líquido</Text>
                <Text style={styles.previewValueTotal}>
                  {formatarMoeda(liquido)}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* PJ options */}
      {tipo === 'PJ' && (
        <>
          <Text style={styles.label}>Imposto (%)</Text>
          <TextInput
            style={styles.input}
            value={impostoPercent}
            onChangeText={setImpostoPercent}
            keyboardType="numeric"
            placeholder="15"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.label}>Outros custos fixos (R$/mês)</Text>
          <TextInput
            style={styles.input}
            value={outrosCustos}
            onChangeText={setOutrosCustos}
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor={Colors.textMuted}
          />
          {bruto > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Estimativa mensal</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Bruto</Text>
                <Text style={styles.previewValue}>{formatarMoeda(bruto)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>
                  - Impostos ({impostoPercent || '0'}%)
                </Text>
                <Text style={styles.previewValueNeg}>
                  -{formatarMoeda(bruto * ((parseFloat(impostoPercent) || 0) / 100))}
                </Text>
              </View>
              {parseFloat(outrosCustos) > 0 && (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>- Outros custos</Text>
                  <Text style={styles.previewValueNeg}>
                    -{formatarMoeda(parseFloat(outrosCustos) || 0)}
                  </Text>
                </View>
              )}
              <View style={[styles.previewRow, styles.previewTotal]}>
                <Text style={styles.previewLabelTotal}>Líquido</Text>
                <Text style={styles.previewValueTotal}>
                  {formatarMoeda(liquido)}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancelar}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
          <Text style={styles.saveBtnText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipoBtnAtivo: {
    backgroundColor: Colors.greenDim,
    borderColor: Colors.green,
  },
  tipoBtnText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tipoBtnTextAtivo: {
    color: Colors.green,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  preview: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  previewValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  previewValueNeg: {
    fontSize: FontSizes.md,
    color: Colors.error,
    fontWeight: '600',
  },
  previewTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
    paddingTop: 8,
  },
  previewLabelTotal: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  previewValueTotal: {
    fontSize: FontSizes.lg,
    color: Colors.green,
    fontWeight: '700',
  },
  hint: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: -4,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  erro: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.green,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: FontSizes.md,
    color: '#000',
    fontWeight: '700',
  },
});
