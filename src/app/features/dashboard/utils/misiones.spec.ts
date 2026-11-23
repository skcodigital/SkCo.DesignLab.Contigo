import { MotivoDescarte } from '@core/state/misiones.store';
import { MISIONES_POR_SEMANA, SEMANA_PROPIA } from '../data/misiones.mock';
import { formatearPesos, nombreCorto, primerNombre } from './formato';
import { indiceValido, misionesDeAsesor, sinDescartes } from './misiones';

describe('misionesDeAsesor', () => {
  it('siempre suma 5 misiones: pendientes + completadas', () => {
    [0, 1, 2, 3, 4].forEach((i) => {
      const s = misionesDeAsesor(i);
      expect(s.pendientes.length + s.completadas.length).toBe(MISIONES_POR_SEMANA);
    });
    expect(misionesDeAsesor(1).completadas.length).toBe(0);
    expect(misionesDeAsesor(4).pendientes.length).toBe(1);
  });

  it('reproduce los datos de ejemplo del prototipo', () => {
    const s = misionesDeAsesor(0);
    expect(s.pendientes[0]).toEqual({
      id: 'x0',
      nombre: 'Jorge Iván Salazar',
      segmento: 'Stability Seekers',
      chip: 'seg',
      saldo: 72e6,
      origen: 'acuerdo',
      origenTexto: 'Inició la conversación el 13 nov',
    });
    expect(s.pendientes[1].origen).toBe('sami');
    expect(s.pendientes[2].origenTexto).toBe('En la lista desde el 13 oct');
    expect(s.completadas[0]).toEqual({ nombre: 'Gloria Inés Mora', texto: 'Acuerdo registrado el 16 nov' });
  });

  it('en asesores impares la primera misión no es un seguimiento', () => {
    expect(misionesDeAsesor(1).pendientes[0].chip).toBe('alta');
  });
});

describe('sinDescartes / indiceValido', () => {
  it('quita las misiones descartadas conservando el orden', () => {
    const r = sinDescartes(SEMANA_PROPIA.pendientes, { oscar: { motivo: MotivoDescarte.FalsaAlarma } });
    expect(r.map((m) => m.id)).toEqual(['pardo', 'mejia', 'torres']);
  });

  it('acota el índice de la destacada a la lista', () => {
    expect(indiceValido(5, 3)).toBe(2);
    expect(indiceValido(1, 3)).toBe(1);
    expect(indiceValido(0, 0)).toBe(0);
  });
});

describe('formato', () => {
  it('pesos con punto de miles', () => {
    expect(formatearPesos(52732191)).toBe('$52.732.191');
    expect(formatearPesos(800000)).toBe('$800.000');
  });

  it('nombres cortos', () => {
    expect(primerNombre('Óscar Camilo Hernández Ramírez')).toBe('Óscar');
    expect(nombreCorto('Juan Camilo Rodríguez')).toBe('Juan Camilo');
  });
});
