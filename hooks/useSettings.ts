import { useState, useEffect, useCallback } from 'react';
import { ModoCalculo } from '../utils/calculations';
import {
  carregarModo,
  salvarModo,
  carregarTema,
  salvarTema,
} from '../utils/storage';

export function useSettings() {
  const [modo, setModoState] = useState<ModoCalculo>('trabalhado');
  const [tema, setTemaState] = useState<'dark' | 'light'>('dark');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([carregarModo(), carregarTema()]).then(([m, t]) => {
      setModoState(m);
      setTemaState(t);
      setCarregando(false);
    });
  }, []);

  const setModo = useCallback(async (m: ModoCalculo) => {
    setModoState(m);
    await salvarModo(m);
  }, []);

  const setTema = useCallback(async (t: 'dark' | 'light') => {
    setTemaState(t);
    await salvarTema(t);
  }, []);

  return { modo, setModo, tema, setTema, carregando };
}
