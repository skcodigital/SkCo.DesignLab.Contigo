import { ResultadoBusqueda } from '../data/busqueda';

/** Minúsculas, sin tildes y sin espacios de borde: así compara el buscador. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Coincide si el texto normalizado del resultado contiene la consulta tal cual o sin puntos,
 * guiones ni espacios (para buscar «900.456.789» o «304 444»).
 */
export function coincide(r: ResultadoBusqueda, consulta: string): boolean {
  const q = normalizar(consulta);
  if (!q) return true;
  const base = normalizar(`${r.claves} ${r.titulo}`);
  return base.includes(q.replace(/[.\-\s]/g, '')) || base.includes(q);
}

export interface TrozosResaltado {
  antes: string;
  marca: string;
  despues: string;
}

/** Parte el título para resaltar con <mark> la primera coincidencia (ignora tildes y mayúsculas). */
export function resaltar(texto: string, consulta: string): TrozosResaltado {
  const q = normalizar(consulta);
  const i = q ? normalizar(texto).indexOf(q) : -1;
  if (i < 0) return { antes: texto, marca: '', despues: '' };
  return { antes: texto.slice(0, i), marca: texto.slice(i, i + q.length), despues: texto.slice(i + q.length) };
}
