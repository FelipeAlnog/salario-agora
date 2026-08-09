import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Renda, ModoCalculo, calcularValorPorSegundo } from '../utils/calculations';

export interface CounterValues {
  ganhoHoje: number;
  ganhoDesdeInicio: number; // desde diaInicio do mês até agora
  ganhoDesdeEmprego: number; // desde a data de admissão até agora
  ganhoSemana: number;
  ganhoMes: number;
  ganhoAno: number;
  vps: number;
  vpm: number;
  vph: number;
  vpd: number;
  diaInicioEfetivo: number;
}

function calcularGanhoHojeFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  if (modo === 'trabalhado') {
    const diaSemana = agora.getDay();
    if (diaSemana === 0 || diaSemana === 6) return 0;

    const parseH = (s: string) => {
      const parts = s.split(':');
      return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
    };

    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const seg = agora.getSeconds();
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);

    if (minutosAgora < minutosInicio) return 0;
    const minutosDecorridos = Math.min(minutosAgora, minutosFim) - minutosInicio;
    const segundosExtras = minutosAgora < minutosFim ? seg : 0;
    return vps * (minutosDecorridos * 60 + segundosExtras);
  } else {
    const seg =
      agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();
    return vps * seg;
  }
}

function calcularGanhoSemanaFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  const parseH = (s: string) => {
    const parts = s.split(':');
    return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
  };

  if (modo === 'trabalhado') {
    const diaSemana = agora.getDay();
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;

    // Days Mon-Fri before today
    let diasUteisPassados = 0;
    if (diaSemana >= 2) diasUteisPassados = diaSemana - 1; // Tue=1, Wed=2...
    else if (diaSemana === 0) diasUteisPassados = 5; // Sun after full week

    const ganhoHoje = calcularGanhoHojeFromRate(renda, modo, vps, agora);
    return vps * diasUteisPassados * segundosPorDia + ganhoHoje;
  } else {
    const diaSemana = agora.getDay();
    const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
    const seg =
      diasDesdeSegunda * 24 * 3600 +
      agora.getHours() * 3600 +
      agora.getMinutes() * 60 +
      agora.getSeconds();
    return vps * seg;
  }
}

function calcularGanhoMesFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  const parseH = (s: string) => {
    const parts = s.split(':');
    return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
  };

  const diaDoMes = agora.getDate();

  if (modo === 'trabalhado') {
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;
    const diasUteisPassados = Math.min(diaDoMes - 1, renda.diasUteis);
    const ganhoHoje = calcularGanhoHojeFromRate(renda, modo, vps, agora);
    return vps * diasUteisPassados * segundosPorDia + ganhoHoje;
  } else {
    const seg =
      (diaDoMes - 1) * 24 * 3600 +
      agora.getHours() * 3600 +
      agora.getMinutes() * 60 +
      agora.getSeconds();
    return vps * seg;
  }
}

// Calcula ganho desde o diaInicio da renda até agora
function calcularGanhoDesdeInicioFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  const parseH = (s: string) => {
    const parts = s.split(':');
    return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
  };

  const diaInicio = renda.diaInicio ?? 1;
  const diaHoje = agora.getDate();

  // Determina a data de início efetiva
  let dataInicio: Date;
  if (diaHoje >= diaInicio) {
    // Ainda neste mês
    dataInicio = new Date(agora.getFullYear(), agora.getMonth(), diaInicio, 0, 0, 0, 0);
  } else {
    // Já passou para o próximo ciclo — início foi no mês anterior
    dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, diaInicio, 0, 0, 0, 0);
  }

  if (modo === 'corrido') {
    const diffMs = agora.getTime() - dataInicio.getTime();
    const diffSeg = Math.max(0, diffMs / 1000);
    return vps * diffSeg;
  } else {
    // Modo trabalhado: contar dias úteis entre dataInicio e agora
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;

    let diasUteisDecorridos = 0;
    const cursor = new Date(dataInicio);
    // Conta dias úteis completos antes de hoje
    while (cursor < agora) {
      const dow = cursor.getDay();
      const isUteisCompleto =
        dow >= 1 && dow <= 5 &&
        (cursor.getFullYear() !== agora.getFullYear() ||
          cursor.getMonth() !== agora.getMonth() ||
          cursor.getDate() !== agora.getDate());
      if (isUteisCompleto) diasUteisDecorridos++;
      cursor.setDate(cursor.getDate() + 1);
    }

    const ganhoHoje = calcularGanhoHojeFromRate(renda, modo, vps, agora);
    return vps * diasUteisDecorridos * segundosPorDia + ganhoHoje;
  }
}

// Total ganho desde a data de admissão até agora
function calcularGanhoDesdeEmpregoFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  if (!renda.dataAdmissao) return 0;

  // Parse "DD/MM/AAAA"
  const partes = renda.dataAdmissao.split('/');
  const dia = parseInt(partes[0] ?? '1', 10);
  const mes = parseInt(partes[1] ?? '1', 10) - 1; // 0-indexed
  const ano = parseInt(partes[2] ?? String(agora.getFullYear()), 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return 0;

  const dataAdmissao = new Date(ano, mes, dia, 0, 0, 0, 0);
  if (dataAdmissao > agora) return 0;

  if (modo === 'corrido') {
    const diffSeg = (agora.getTime() - dataAdmissao.getTime()) / 1000;
    return vps * diffSeg;
  } else {
    const parseH = (s: string) => {
      const parts = s.split(':');
      return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
    };
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;

    // Conta dias úteis desde admissão até hoje (exclusive hoje)
    let diasUteisDecorridos = 0;
    const cursor = new Date(dataAdmissao);
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    while (cursor < hoje) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) diasUteisDecorridos++;
      cursor.setDate(cursor.getDate() + 1);
    }

    const ganhoHoje = calcularGanhoHojeFromRate(renda, modo, vps, agora);
    return vps * diasUteisDecorridos * segundosPorDia + ganhoHoje;
  }
}

function calcularGanhoAnoFromRate(
  renda: Renda,
  modo: ModoCalculo,
  vps: number,
  agora: Date
): number {
  // Se há data de admissão, o "este ano" começa no maior valor entre:
  // 01/jan do ano atual OU a data de admissão (caso seja neste ano)
  let inicio = new Date(agora.getFullYear(), 0, 1);

  if (renda.dataAdmissao) {
    const partes = renda.dataAdmissao.split('/');
    const dia = parseInt(partes[0] ?? '1', 10);
    const mes = parseInt(partes[1] ?? '1', 10) - 1;
    const ano = parseInt(partes[2] ?? '0', 10);
    if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
      const dataAdmissao = new Date(ano, mes, dia, 0, 0, 0, 0);
      // Se admissão é depois de 01/jan deste ano, usa a admissão como início
      if (dataAdmissao > inicio) inicio = dataAdmissao;
    }
  }

  if (inicio > agora) return 0;

  if (modo === 'corrido') {
    const diffSeconds = (agora.getTime() - inicio.getTime()) / 1000;
    return vps * diffSeconds;
  } else {
    const parseH = (s: string) => {
      const parts = s.split(':');
      return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
    };
    const minutosInicio = parseH(renda.horarioInicio);
    const minutosFim = parseH(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;

    let diasUteis = 0;
    const cursor = new Date(inicio);
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    while (cursor < hoje) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) diasUteis++;
      cursor.setDate(cursor.getDate() + 1);
    }
    const ganhoHoje = calcularGanhoHojeFromRate(renda, modo, vps, agora);
    return vps * diasUteis * segundosPorDia + ganhoHoje;
  }
}

export function useCounter(rendas: Renda[], modo: ModoCalculo): CounterValues {
  const [values, setValues] = useState<CounterValues>({
    ganhoHoje: 0,
    ganhoDesdeInicio: 0,
    ganhoDesdeEmprego: 0,
    ganhoSemana: 0,
    ganhoMes: 0,
    ganhoAno: 0,
    vps: 0,
    vpm: 0,
    vph: 0,
    vpd: 0,
    diaInicioEfetivo: 1,
  });

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        appState.current = nextState;
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const rendasAtivas = rendas.filter((r) => r.ativa);

    const tick = () => {
      const agora = new Date();

      let totalHoje = 0;
      let totalDesdeInicio = 0;
      let totalDesdeEmprego = 0;
      let totalSemana = 0;
      let totalMes = 0;
      let totalAno = 0;
      let totalVps = 0;

      for (const renda of rendasAtivas) {
        const vps = calcularValorPorSegundo(renda, modo);
        totalVps += vps;
        totalHoje += calcularGanhoHojeFromRate(renda, modo, vps, agora);
        totalDesdeInicio += calcularGanhoDesdeInicioFromRate(renda, modo, vps, agora);
        totalDesdeEmprego += calcularGanhoDesdeEmpregoFromRate(renda, modo, vps, agora);
        totalSemana += calcularGanhoSemanaFromRate(renda, modo, vps, agora);
        totalMes += calcularGanhoMesFromRate(renda, modo, vps, agora);
        totalAno += calcularGanhoAnoFromRate(renda, modo, vps, agora);
      }

      const primeiraRenda = rendasAtivas[0];
      const diaInicioEfetivo = primeiraRenda?.diaInicio ?? 1;

      setValues({
        ganhoHoje: totalHoje,
        ganhoDesdeInicio: totalDesdeInicio,
        ganhoDesdeEmprego: totalDesdeEmprego,
        ganhoSemana: totalSemana,
        ganhoMes: totalMes,
        ganhoAno: totalAno,
        vps: totalVps,
        vpm: totalVps * 60,
        vph: totalVps * 3600,
        vpd: totalVps * (primeiraRenda?.horasPorDia ?? 8) * 3600,
        diaInicioEfetivo,
      });
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [rendas, modo]);

  return values;
}
