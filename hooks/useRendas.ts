import { useState, useEffect, useCallback } from 'react';
import { Renda } from '../utils/calculations';
import { carregarRendas, salvarRendas } from '../utils/storage';

export function useRendas() {
  const [rendas, setRendas] = useState<Renda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRendas().then((r) => {
      setRendas(r);
      setCarregando(false);
    });
  }, []);

  const adicionarRenda = useCallback(async (renda: Renda) => {
    setRendas((prev) => {
      const novas = [...prev, renda];
      salvarRendas(novas);
      return novas;
    });
  }, []);

  const editarRenda = useCallback(async (renda: Renda) => {
    setRendas((prev) => {
      const novas = prev.map((r) => (r.id === renda.id ? renda : r));
      salvarRendas(novas);
      return novas;
    });
  }, []);

  const removerRenda = useCallback(async (id: string) => {
    setRendas((prev) => {
      const novas = prev.filter((r) => r.id !== id);
      salvarRendas(novas);
      return novas;
    });
  }, []);

  const toggleAtiva = useCallback(async (id: string) => {
    setRendas((prev) => {
      const novas = prev.map((r) =>
        r.id === id ? { ...r, ativa: !r.ativa } : r
      );
      salvarRendas(novas);
      return novas;
    });
  }, []);

  const resetarRendas = useCallback(async () => {
    setRendas([]);
    salvarRendas([]);
  }, []);

  return {
    rendas,
    carregando,
    adicionarRenda,
    editarRenda,
    removerRenda,
    toggleAtiva,
    resetarRendas,
  };
}
