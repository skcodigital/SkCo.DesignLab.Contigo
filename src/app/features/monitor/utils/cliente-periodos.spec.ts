import { INICIO_HISTORIA_OSCAR } from '@features/monitor/data/cliente.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import {
  etiquetaPeriodoCliente,
  insigniaRango,
  OPCIONES_PERIODO_CLIENTE,
  PERIODO_CLIENTE,
  PERIODO_INICIAL_CLIENTE,
  rangoPeriodoCliente,
} from '@features/monitor/utils/cliente-periodos';

const rango = (valor: number) => rangoPeriodoCliente(valor, HOY_MONITOR, INICIO_HISTORIA_OSCAR);

describe('cliente-periodos', () => {
  it('ofrece los periodos de producción, con «Desde el inicio» al final, y abre en el año en curso', () => {
    expect(OPCIONES_PERIODO_CLIENTE.map((o) => o.valor)).toEqual([1, 2, 3, 4, 9, 10, 7, 8, 6, 5]);
    expect(OPCIONES_PERIODO_CLIENTE.at(-1)?.nombre).toBe('Desde el inicio');
    expect(PERIODO_INICIAL_CLIENTE).toBe(PERIODO_CLIENTE.anioEnCurso);
  });

  it('calcula el rango de cada periodo desde hoy (12 de noviembre de 2026)', () => {
    expect(rango(PERIODO_CLIENTE.ultimoMes)).toEqual({ inicio: '2026-10-12', fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.ultimos6Meses)).toEqual({ inicio: '2026-05-12', fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.anioEnCurso)).toEqual({ inicio: '2026-01-01', fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.ultimoAnio)).toEqual({ inicio: '2025-11-12', fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.anioAnterior)).toEqual({ inicio: '2025-01-01', fin: '2025-12-31' });
    expect(rango(PERIODO_CLIENTE.ultimos5Anios)).toEqual({ inicio: '2021-11-12', fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.desdeElInicio)).toEqual({ inicio: INICIO_HISTORIA_OSCAR, fin: '2026-11-12' });
    expect(rango(PERIODO_CLIENTE.personalizado)).toBeNull();
  });

  it('muestra el rango como moment en español y lo oculta con «Desde el inicio» y «Personalizado»', () => {
    const ytd = rango(PERIODO_CLIENTE.anioEnCurso);
    expect(insigniaRango(PERIODO_CLIENTE.anioEnCurso, ytd!)).toBe('01/ene/2026 - 12/nov/2026');
    expect(insigniaRango(PERIODO_CLIENTE.ultimos3Meses, { inicio: '2026-08-12', fin: '2026-11-12' })).toBe(
      '12/ago/2026 - 12/nov/2026',
    );
    expect(insigniaRango(PERIODO_CLIENTE.desdeElInicio, ytd!)).toBe('');
    expect(insigniaRango(PERIODO_CLIENTE.personalizado, ytd!)).toBe('');
  });

  it('nombra el periodo para «Fecha seleccionada»', () => {
    expect(etiquetaPeriodoCliente(4)).toBe('Año en curso (YTD)');
    expect(etiquetaPeriodoCliente(5)).toBe('Desde el inicio');
    expect(etiquetaPeriodoCliente(99)).toBe('Rango desconocido');
  });
});
