import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { CATALOGO_EXTERIOR, PORTAFOLIOS_LISTA } from '@features/monitor/data/exterior-catalogos.mock';
import { FiltrosPortafolios } from '@features/monitor/interfaces/exterior';
import {
  alternarIndicador,
  filtrarPortafolios,
  itemsIndicador,
  opcionesClasificacion,
  opcionesPerfil,
  portafolioDesactualizado,
  tooltipPortafolioDesactualizado,
} from '@features/monitor/utils/exterior-listas';

const TODOS: FiltrosPortafolios = { clasificacion: '', perfil: '', termino: '', mostrarInactivos: false };

describe('exterior-listas', () => {
  it('arma las opciones de clasificación y perfil (NA como «Otros»)', () => {
    const clasificaciones = opcionesClasificacion(PORTAFOLIOS_LISTA).map((o) => o.nombre);
    expect(clasificaciones[0]).toBe('Clasificación');
    expect(clasificaciones).toContain('Renta fija');
    expect(new Set(clasificaciones).size).toBe(clasificaciones.length);
    const perfiles = opcionesPerfil(PORTAFOLIOS_LISTA).map((o) => o.nombre);
    expect(perfiles[0]).toBe('Perfil de riesgo');
    expect(perfiles).toContain('Otros');
    expect(perfiles).not.toContain('NA');
  });

  it('está desactualizado con más de 30 días sin valor de unidad', () => {
    expect(portafolioDesactualizado('2026-10-13', HOY_MONITOR)).toBe(false);
    expect(portafolioDesactualizado('2026-10-12', HOY_MONITOR)).toBe(true);
    expect(portafolioDesactualizado('', HOY_MONITOR)).toBe(false);
    expect(tooltipPortafolioDesactualizado('2025-03-14')).toBe(
      'Datos desactualizados. Última fecha de valor unitario: 14/03/2025',
    );
  });

  it('filtra por clasificación, perfil, texto e inactivos', () => {
    const activos = filtrarPortafolios(PORTAFOLIOS_LISTA, TODOS, HOY_MONITOR);
    expect(activos.length).toBe(PORTAFOLIOS_LISTA.length - 2);
    expect(filtrarPortafolios(PORTAFOLIOS_LISTA, { ...TODOS, mostrarInactivos: true }, HOY_MONITOR).length).toBe(
      PORTAFOLIOS_LISTA.length,
    );
    const liquidez = filtrarPortafolios(PORTAFOLIOS_LISTA, { ...TODOS, clasificacion: 'Liquidez' }, HOY_MONITOR);
    expect(liquidez.every((p) => p.clasificacion === 'Liquidez')).toBe(true);
    expect(filtrarPortafolios(PORTAFOLIOS_LISTA, { ...TODOS, clasificacion: 'Clasificación' }, HOY_MONITOR)).toEqual(
      activos,
    );
    const otros = filtrarPortafolios(PORTAFOLIOS_LISTA, { ...TODOS, perfil: 'Otros', mostrarInactivos: true }, HOY_MONITOR);
    expect(otros.map((p) => p.clave)).toEqual(['FPVDEUCORP', 'FVPRFMAR25']);
    const busqueda = filtrarPortafolios(PORTAFOLIOS_LISTA, { ...TODOS, termino: 'STRATEGIST' }, HOY_MONITOR);
    expect(busqueda.map((p) => p.nombre)).toEqual([
      'FPV Strategist Conservador',
      'FPV Strategist Moderado',
      'FPV Strategist Liquidez Col',
    ]);
  });

  it('separa divisas e indicadores y muestra la UVR como «Inflación»', () => {
    const divisas = itemsIndicador(CATALOGO_EXTERIOR.indicadores, 'divisa');
    expect(divisas.map((d) => d.nombre)).toEqual(['Dólar', 'Euro', 'Libra esterlina', 'Yen']);
    const indicadores = itemsIndicador(CATALOGO_EXTERIOR.indicadores, 'indicador');
    expect(indicadores[0]).toEqual({ clave: 'UVR', tipo: 'indicador', nombre: 'Inflación' });
  });

  it('marca y desmarca divisas e indicadores', () => {
    const una = alternarIndicador([], 'divisa', 'US$');
    const dos = alternarIndicador(una, 'indicador', 'UVR');
    expect(dos).toEqual([
      { tipo: 'divisa', clave: 'US$' },
      { tipo: 'indicador', clave: 'UVR' },
    ]);
    expect(alternarIndicador(dos, 'divisa', 'US$')).toEqual([{ tipo: 'indicador', clave: 'UVR' }]);
  });
});
