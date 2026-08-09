export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarMoedaCompacta(valor: number): string {
  if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(2)}M`;
  }
  if (valor >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(2)}K`;
  }
  return formatarMoeda(valor);
}

export function formatarTempo(
  horas: number,
  minutos: number,
  segundos?: number
): string {
  if (horas > 0) {
    if (segundos !== undefined) {
      return `${horas}h${String(minutos).padStart(2, '0')}min${String(segundos).padStart(2, '0')}s`;
    }
    return `${horas}h${String(minutos).padStart(2, '0')}min`;
  }
  if (minutos > 0) {
    if (segundos !== undefined) {
      return `${minutos}min${String(segundos).padStart(2, '0')}s`;
    }
    return `${minutos}min`;
  }
  return `${segundos ?? 0}s`;
}

export function formatarHorario(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatarPorcentagem(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

export function formatarMoedaPorUnidade(
  valor: number,
  unidade: string
): string {
  return `${formatarMoeda(valor)}/${unidade}`;
}
