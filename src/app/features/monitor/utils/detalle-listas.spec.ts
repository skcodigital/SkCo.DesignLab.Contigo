import { COMPANIAS_REFERENCIA, HOY_MONITOR, MEZCLAS } from '@features/monitor/data/detalle-catalogos.mock';
import {
  alternarId,
  alternarReferencia,
  aplanarReferencias,
  desactualizado,
  filtrarReferencias,
  mezclasPorPerfil,
  opcionesEntidad,
  opcionesTipoAhorro,
  tituloPalabras,
  tooltipDesactualizado,
  tooltipReferencia,
} from '@features/monitor/utils/detalle-listas';

const TODOS = { entidad: 'Todos', tipo: 'Tipo ahorro', termino: '', mostrarInactivos: false };

describe('detalle-listas', () => {
  const items = aplanarReferencias([...COMPANIAS_REFERENCIA, COMPANIAS_REFERENCIA[0]]);

  it('aplana los portafolios sin repetir compañía + portafolio', () => {
    expect(items.length).toBe(8);
    expect(items[0]).toEqual(
      expect.objectContaining({ id: 'AA01', idCompania: '1', tipoVisible: 'Voluntario', nombreCompania: 'ADMINISTRADORA ANDINA' }),
    );
  });

  it('arma los filtros de entidad y tipo de ahorro', () => {
    expect(opcionesEntidad(COMPANIAS_REFERENCIA).map((o) => o.nombre)).toEqual([
      'Todos',
      'ADMINISTRADORA ANDINA',
      'FIDUCIARIA DEL VALLE',
      'PENSIONES CORDILLERA',
    ]);
    expect(opcionesTipoAhorro(COMPANIAS_REFERENCIA).map((o) => o.nombre)).toEqual([
      'Tipo ahorro',
      'Voluntario',
      'Obligatorio',
      'Fic',
    ]);
  });

  it('oculta los desactualizados salvo que se pidan y filtra por entidad, tipo y nombre', () => {
    expect(desactualizado('2025-08-29', HOY_MONITOR)).toBe(true);
    expect(desactualizado('', HOY_MONITOR)).toBe(false);
    expect(filtrarReferencias(items, TODOS, HOY_MONITOR).length).toBe(6);
    expect(filtrarReferencias(items, { ...TODOS, mostrarInactivos: true }, HOY_MONITOR).length).toBe(8);
    expect(filtrarReferencias(items, { ...TODOS, entidad: 'PENSIONES CORDILLERA' }, HOY_MONITOR).length).toBe(2);
    expect(filtrarReferencias(items, { ...TODOS, tipo: 'Fic' }, HOY_MONITOR).length).toBe(1);
    expect(filtrarReferencias(items, { ...TODOS, termino: 'riesgo' }, HOY_MONITOR).map((i) => i.id)).toEqual(['PC02']);
  });

  it('arma los tooltips', () => {
    expect(tooltipReferencia(items[0], TODOS)).toBe('ADMINISTRADORA ANDINA · Voluntario');
    expect(tooltipReferencia(items[0], { entidad: 'X', tipo: 'Voluntario' })).toBeNull();
    expect(tooltipDesactualizado('2025-08-29')).toBe(
      'Datos desactualizados. Último reporte a la Superfinanciera: 29/08/2025',
    );
  });

  it('marca y desmarca referencias e ids', () => {
    const una = alternarReferencia([], items[0]);
    expect(una).toEqual([{ idCompania: '1', idPortafolio: 'AA01', tipo: 'VOLUNTARIO' }]);
    expect(alternarReferencia(una, items[0])).toEqual([]);
    expect(alternarId([1, 2], 2)).toEqual([1]);
    expect(alternarId([1], 3)).toEqual([1, 3]);
  });

  it('ordena las mezclas por perfil y les pone título', () => {
    expect(mezclasPorPerfil(MEZCLAS).map((m) => m.nombre)).toEqual([
      'CAUTA',
      'DISCRETA',
      'DINÁMICA',
      'PACIENTE',
      'AUDAZ',
      'DECIDIDA',
    ]);
    expect(tituloPalabras('DINÁMICA')).toBe('Dinámica');
    expect(tituloPalabras('RENTA FIJA')).toBe('Renta Fija');
  });
});
