import AsyncStorage from '@react-native-async-storage/async-storage';
import { Renda } from './calculations';
import { ModoCalculo } from './calculations';

const KEYS = {
  RENDAS: '@salario_agora:rendas',
  MODO: '@salario_agora:modo',
  TEMA: '@salario_agora:tema',
};

export async function carregarRendas(): Promise<Renda[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.RENDAS);
    if (!json) return [];
    return JSON.parse(json) as Renda[];
  } catch {
    return [];
  }
}

export async function salvarRendas(rendas: Renda[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.RENDAS, JSON.stringify(rendas));
  } catch {
    // ignore
  }
}

export async function carregarModo(): Promise<ModoCalculo> {
  try {
    const val = await AsyncStorage.getItem(KEYS.MODO);
    if (val === 'corrido' || val === 'trabalhado') return val;
    return 'trabalhado';
  } catch {
    return 'trabalhado';
  }
}

export async function salvarModo(modo: ModoCalculo): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.MODO, modo);
  } catch {
    // ignore
  }
}

export async function carregarTema(): Promise<'dark' | 'light'> {
  try {
    const val = await AsyncStorage.getItem(KEYS.TEMA);
    if (val === 'light' || val === 'dark') return val;
    return 'dark';
  } catch {
    return 'dark';
  }
}

export async function salvarTema(tema: 'dark' | 'light'): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TEMA, tema);
  } catch {
    // ignore
  }
}

export async function resetarTodosDados(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.RENDAS, KEYS.MODO, KEYS.TEMA]);
  } catch {
    // ignore
  }
}
