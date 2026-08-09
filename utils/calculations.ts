export interface Renda {
  id: string;
  nome: string;
  tipo: 'CLT' | 'PJ';
  salarioBruto: number;
  diasUteis: number;
  horasPorDia: number;
  horarioInicio: string; // "HH:MM"
  horarioFim: string;    // "HH:MM"
  ativa: boolean;
  diaInicio: number; // dia do mês em que começa a contagem (1-31)
  dataAdmissao?: string; // "DD/MM/AAAA" — data de admissão / início desta renda
  // CLT
  descontarINSS?: boolean;
  descontarIRRF?: boolean;
  // PJ
  impostoPercent?: number;
  outrosCustos?: number;
}

export type ModoCalculo = 'trabalhado' | 'corrido';

// INSS 2024 progressive table
function calcularINSS(salarioBruto: number): number {
  const faixas = [
    { limite: 1412.0, aliquota: 0.075 },
    { limite: 2666.68, aliquota: 0.09 },
    { limite: 4000.03, aliquota: 0.12 },
    { limite: 7786.02, aliquota: 0.14 },
  ];

  let inss = 0;
  let baseRestante = salarioBruto;
  let limiteAnterior = 0;

  for (const faixa of faixas) {
    if (baseRestante <= 0) break;
    const faixaValor = Math.min(baseRestante, faixa.limite - limiteAnterior);
    inss += faixaValor * faixa.aliquota;
    baseRestante -= faixaValor;
    limiteAnterior = faixa.limite;
    if (salarioBruto <= faixa.limite) break;
  }

  // Teto: acima de 7786.02 aplica-se 14% sobre a diferença
  if (salarioBruto > 7786.02) {
    inss += (salarioBruto - 7786.02) * 0.14;
  }

  return inss;
}

// IRRF simplified
function calcularIRRF(baseCalculo: number): number {
  if (baseCalculo <= 2259.2) return 0;
  if (baseCalculo <= 2826.65) return baseCalculo * 0.075 - 169.44;
  if (baseCalculo <= 3751.05) return baseCalculo * 0.15 - 381.44;
  if (baseCalculo <= 4664.68) return baseCalculo * 0.225 - 662.77;
  return baseCalculo * 0.275 - 896.0;
}

export function calcularSalarioLiquido(renda: Renda): number {
  if (renda.tipo === 'CLT') {
    let liquido = renda.salarioBruto;
    if (renda.descontarINSS) {
      liquido -= calcularINSS(renda.salarioBruto);
    }
    if (renda.descontarIRRF) {
      const baseIRRF = renda.descontarINSS
        ? renda.salarioBruto - calcularINSS(renda.salarioBruto)
        : renda.salarioBruto;
      liquido -= calcularIRRF(baseIRRF);
    }
    return Math.max(0, liquido);
  } else {
    // PJ
    const impostoDecimal = (renda.impostoPercent ?? 0) / 100;
    const impostos = renda.salarioBruto * impostoDecimal;
    const outros = renda.outrosCustos ?? 0;
    return Math.max(0, renda.salarioBruto - impostos - outros);
  }
}

export function calcularDetalheCLT(salarioBruto: number): {
  inss: number;
  irrf: number;
  liquido: number;
} {
  const inss = calcularINSS(salarioBruto);
  const baseIRRF = salarioBruto - inss;
  const irrf = calcularIRRF(baseIRRF);
  return { inss, irrf, liquido: Math.max(0, salarioBruto - inss - irrf) };
}

// Parse "HH:MM" into minutes since midnight
function parseHorario(horario: string): number {
  const parts = horario.split(':');
  const h = parseInt(parts[0] ?? '0', 10);
  const m = parseInt(parts[1] ?? '0', 10);
  return h * 60 + m;
}

export function calcularValorPorSegundo(
  renda: Renda,
  modo: ModoCalculo
): number {
  const salarioLiquido = calcularSalarioLiquido(renda);

  if (modo === 'trabalhado') {
    const totalSegundos = renda.diasUteis * renda.horasPorDia * 3600;
    if (totalSegundos === 0) return 0;
    return salarioLiquido / totalSegundos;
  } else {
    // corrido: divide by all seconds in the month (30 days)
    const totalSegundos = 30 * 24 * 3600;
    return salarioLiquido / totalSegundos;
  }
}

// Returns seconds elapsed today for "trabalhado" mode
export function calcularSegundosTrabalhadosHoje(renda: Renda): number {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0=Dom, 6=Sáb

  // Not a weekday
  if (diaSemana === 0 || diaSemana === 6) return 0;

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const minutosInicio = parseHorario(renda.horarioInicio);
  const minutosFim = parseHorario(renda.horarioFim);

  if (minutosAgora < minutosInicio) return 0;
  if (minutosAgora >= minutosFim) {
    return (minutosFim - minutosInicio) * 60;
  }

  const minutosDecorridos = minutosAgora - minutosInicio;
  const segundosExtras = agora.getSeconds();
  return minutosDecorridos * 60 + segundosExtras;
}

// Returns total seconds elapsed today for "corrido" mode
export function calcularSegundosCorridosHoje(): number {
  const agora = new Date();
  return agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();
}

// Returns total seconds worked this week (Mon–today) for a renda
export function calcularSegundosTrabalhadosSemana(renda: Renda): number {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0=Dom...6=Sáb
  const minutosInicio = parseHorario(renda.horarioInicio);
  const minutosFim = parseHorario(renda.horarioFim);
  const segundosPorDia = (minutosFim - minutosInicio) * 60;

  // Days elapsed since Monday (Mon=1)
  let diasPassados = diaSemana === 0 ? 6 : diaSemana - 1; // days before today this week (weekdays only)

  // Count weekdays before today in this week
  let diasUteisPassados = 0;
  for (let i = 0; i < diasPassados; i++) {
    const dayOfWeek = diaSemana - diasPassados + i;
    // dayOfWeek: Mon=1 ... Fri=5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) diasUteisPassados++;
  }

  const segundosSemanaAnterior = diasUteisPassados * segundosPorDia;
  const segundosHoje = calcularSegundosTrabalhadosHoje(renda);
  return segundosSemanaAnterior + segundosHoje;
}

export function calcularGanhoHoje(renda: Renda, modo: ModoCalculo): number {
  const vps = calcularValorPorSegundo(renda, modo);
  const segundos =
    modo === 'trabalhado'
      ? calcularSegundosTrabalhadosHoje(renda)
      : calcularSegundosCorridosHoje();
  return vps * segundos;
}

export function calcularGanhoSemana(renda: Renda, modo: ModoCalculo): number {
  const vps = calcularValorPorSegundo(renda, modo);
  if (modo === 'trabalhado') {
    return vps * calcularSegundosTrabalhadosSemana(renda);
  } else {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
    const segundosSemana =
      diasDesdeSegunda * 24 * 3600 + calcularSegundosCorridosHoje();
    return vps * segundosSemana;
  }
}

export function calcularGanhoMes(renda: Renda, modo: ModoCalculo): number {
  const agora = new Date();
  const diaDoMes = agora.getDate();
  const diasNoMes = new Date(
    agora.getFullYear(),
    agora.getMonth() + 1,
    0
  ).getDate();

  const vps = calcularValorPorSegundo(renda, modo);

  if (modo === 'trabalhado') {
    // Approximate: proportional weekdays elapsed
    const diasUteisElapsed = Math.min(diaDoMes - 1, renda.diasUteis);
    const minutosInicio = parseHorario(renda.horarioInicio);
    const minutosFim = parseHorario(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;
    return vps * (diasUteisElapsed * segundosPorDia + calcularSegundosTrabalhadosHoje(renda));
  } else {
    const segundosMes =
      (diaDoMes - 1) * 24 * 3600 + calcularSegundosCorridosHoje();
    return vps * segundosMes;
  }
}

export function calcularGanhoAno(renda: Renda, modo: ModoCalculo): number {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), 0, 1);
  const diffMs = agora.getTime() - inicio.getTime();
  const diffSeconds = diffMs / 1000;
  const vps = calcularValorPorSegundo(renda, modo);

  if (modo === 'trabalhado') {
    // Estimate: assume 22 working days per month, 12 months
    const diasUteisAno = renda.diasUteis * 12;
    const minutosInicio = parseHorario(renda.horarioInicio);
    const minutosFim = parseHorario(renda.horarioFim);
    const segundosPorDia = (minutosFim - minutosInicio) * 60;
    const totalSegundosAno = diasUteisAno * segundosPorDia;
    // Proportion of year elapsed
    const diasAno = 365;
    const proporcao = Math.min(diffSeconds / (diasAno * 24 * 3600), 1);
    return vps * totalSegundosAno * proporcao;
  } else {
    return vps * Math.min(diffSeconds, 365 * 24 * 3600);
  }
}

// Progress bar: % of work day complete
export function calcularProgressoDia(renda: Renda): number {
  const agora = new Date();
  const diaSemana = agora.getDay();
  if (diaSemana === 0 || diaSemana === 6) return 0;

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const minutosInicio = parseHorario(renda.horarioInicio);
  const minutosFim = parseHorario(renda.horarioFim);
  const duracao = minutosFim - minutosInicio;

  if (duracao <= 0) return 0;
  if (minutosAgora < minutosInicio) return 0;
  if (minutosAgora >= minutosFim) return 1;

  return (minutosAgora - minutosInicio) / duracao;
}

// Time conversion: seconds of work = R$ amount
export function calcularTempoParaValor(
  valor: number,
  vps: number
): { horas: number; minutos: number; segundos: number } {
  if (vps <= 0) return { horas: 0, minutos: 0, segundos: 0 };
  const totalSegundos = Math.round(valor / vps);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return { horas, minutos, segundos };
}
