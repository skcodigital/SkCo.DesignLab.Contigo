import { Component, input, output, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvisoStore } from '@core/state/aviso.store';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { GraficaLineasCompacta } from '@features/monitor/components/comunes/grafica-lineas-compacta/grafica-lineas-compacta';
import { GraficaLineas } from '@features/monitor/components/comunes/grafica-lineas/grafica-lineas';
import { GraficaTortaCompacta } from '@features/monitor/components/comunes/grafica-torta-compacta/grafica-torta-compacta';
import { Comparacion } from '@features/monitor/components/detalle/comparacion/comparacion';
import { Detalle } from '@features/monitor/components/detalle/detalle/detalle';
import { GraficaContratos } from '@features/monitor/components/detalle/grafica-contratos/grafica-contratos';
import { GraficaRiesgoRetorno } from '@features/monitor/components/detalle/grafica-riesgo-retorno/grafica-riesgo-retorno';
import { GraficaTendencia } from '@features/monitor/components/detalle/grafica-tendencia/grafica-tendencia';
import { ListaCdt } from '@features/monitor/components/detalle/lista-cdt/lista-cdt';
import { ListaMezclas } from '@features/monitor/components/detalle/lista-mezclas/lista-mezclas';
import { ListaReferencias } from '@features/monitor/components/detalle/lista-referencias/lista-referencias';
import { RendimientoMovil } from '@features/monitor/components/detalle/rendimiento-movil/rendimiento-movil';
import { TEXTOS } from '@features/monitor/constants/textos';
import {
  COMPANIAS_REFERENCIA,
  HOY_MONITOR,
  MEZCLAS,
  PLAZOS_CDT,
} from '@features/monitor/data/detalle-catalogos.mock';
import {
  CONTRATOS_GRAFICA_EJEMPLO,
  DETALLE_MEZCLA_CLIENTE,
  DETALLE_REFERENCIA_CLIENTE,
  DETALLES_PORTAFOLIOS_OSCAR,
} from '@features/monitor/data/detalle-cliente.mock';
import { ACTIVOS_EXTERIOR_EJEMPLO, PERIODO_INICIAL_EXTERIOR } from '@features/monitor/data/detalle-exterior.mock';
import { ActivoComparado, ActivoDetalle, ReferenciaSeleccionada } from '@features/monitor/interfaces/detalle';

/**
 * Prueba de humo del detalle del Monitor en jsdom: monta cada pieza con los datos de ejemplo de las dos vistas.
 * ECharts necesita canvas: la gráfica base se reemplaza por una vacía con las mismas entradas.
 */

@Component({ selector: 'nc-mon-grafica', template: '' })
class GraficaFalsa {
  readonly opciones = input<unknown>();
  readonly reemplazar = input(true);
  readonly lista = output<unknown>();
}

class ObservadorFalso {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

let movil = false;

function texto(f: ComponentFixture<unknown>): string {
  return (f.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function todos(f: ComponentFixture<unknown>, selector: string): HTMLElement[] {
  return Array.from((f.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(selector));
}

function boton(f: ComponentFixture<unknown>, selector: string, contiene: string): HTMLElement {
  const b = todos(f, selector).find((e) => e.textContent?.includes(contiene));
  if (!b) {
    throw new Error(`No hay «${contiene}» en ${selector}`);
  }
  return b;
}

async function montar<T>(tipo: Type<T>, entradas: Record<string, unknown>): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent(tipo);
  Object.entries(entradas).forEach(([k, v]) => f.componentRef.setInput(k, v));
  await f.whenStable();
  return f;
}

beforeAll(() => {
  globalThis.ResizeObserver ??= ObservadorFalso as unknown as typeof ResizeObserver;
  window.matchMedia = ((q: string) => ({
    matches: movil && q.includes('max-width'),
    media: q,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
  movil = false;
  for (const c of [GraficaLineas, GraficaLineasCompacta, GraficaTortaCompacta, GraficaTendencia, GraficaRiesgoRetorno]) {
    TestBed.overrideComponent(c as Type<unknown>, { remove: { imports: [Grafica] }, add: { imports: [GraficaFalsa] } });
  }
});

describe('nc-mon-detalle (cliente)', () => {
  it('arma el detalle de una mezcla: pestañas, desempeño sin TIR, tendencia y documentos', async () => {
    const f = await montar(Detalle, { activo: DETALLE_MEZCLA_CLIENTE, ocultarTir: true, hoy: HOY_MONITOR });
    expect(texto(f)).toContain('Mezcla Invest-ed PACIENTE');
    const pestanas = todos(f, '.pestana');
    expect(pestanas.map((p) => p.textContent?.trim())).toEqual(['Desempeño', 'Tendencia', 'Rebalanceos', 'Documentos']);
    expect(pestanas.map((p) => (p as HTMLButtonElement).disabled)).toEqual([false, false, true, false]);
    expect(texto(f)).toContain('Desempeño de la mezcla en diferentes periodos.');
    expect(texto(f)).not.toContain('TIR');

    pestanas[1].click();
    await f.whenStable();
    expect(texto(f)).toContain('Composición');
    expect(texto(f)).toContain('Periodo seleccionado: Último mes');
    expect(texto(f)).toContain('12/10/2026 - 12/11/2026');

    pestanas[3].click();
    await f.whenStable();
    expect(todos(f, '.tarjeta').length).toBe(3);
    expect(texto(f)).toContain('Octubre 2026');
    todos(f, '.descargar')[0].click();
    expect(TestBed.inject(AvisoStore).actual()?.texto).toBe(TEXTOS.sinDescargas);
  });

  it('un portafolio de Óscar muestra la TIR; la «x» cierra', async () => {
    const f = await montar(Detalle, { activo: DETALLES_PORTAFOLIOS_OSCAR[3], hoy: HOY_MONITOR });
    expect(texto(f)).toContain('Desempeño del portafolio en diferentes periodos.');
    expect(texto(f)).toContain('TIR');
    let cerrado = false;
    f.componentInstance.cerrar.subscribe(() => (cerrado = true));
    todos(f, '.cerrar')[0].click();
    expect(cerrado).toBe(true);
  });

  it('un portafolio de la competencia lleva el logo y no tiene documentos', async () => {
    const f = await montar(Detalle, { activo: DETALLE_REFERENCIA_CLIENTE, ocultarTir: true });
    expect(todos(f, 'img.logo').length).toBe(1);
    expect(texto(f)).toContain('Desempeño del portafolio de la competencia');
    expect((boton(f, '.pestana', 'Documentos') as HTMLButtonElement).disabled).toBe(true);
  });

  it('pinta el error del servicio en desempeño y documentos', async () => {
    const conError: ActivoDetalle = { ...DETALLES_PORTAFOLIOS_OSCAR[0], desempeno: null, documentos: null };
    const f = await montar(Detalle, { activo: conError });
    expect(todos(f, 'nc-mon-error-servicio').length).toBe(1);
    boton(f, '.pestana', 'Documentos').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-error-servicio').length).toBe(1);
    expect(todos(f, '.descargar').length).toBe(0);
  });

  it('en móvil muestra el menú de pestañas y «Volver»', async () => {
    movil = true;
    const f = await montar(Detalle, { activo: DETALLE_MEZCLA_CLIENTE, hoy: HOY_MONITOR });
    expect(todos(f, '.opcion').length).toBe(4);
    boton(f, '.opcion', 'Desempeño').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-tarjetas-rendimiento').length).toBe(1);
    let cerrado = false;
    f.componentInstance.cerrar.subscribe(() => (cerrado = true));
    todos(f, '.volver')[0].click();
    await f.whenStable();
    expect(todos(f, '.opcion').length).toBe(4);
    todos(f, '.volver')[0].click();
    expect(cerrado).toBe(true);
  });
});

describe('nc-mon-detalle (exterior)', () => {
  it('arranca la tendencia en el periodo de la comparación y no muestra logo ni TIR', async () => {
    const mezcla = ACTIVOS_EXTERIOR_EJEMPLO.find((a) => a.tipo === 'mezcla')?.detalle as ActivoDetalle;
    const f = await montar(Detalle, { activo: mezcla, vista: 'exterior', periodo: PERIODO_INICIAL_EXTERIOR, hoy: HOY_MONITOR });
    expect(todos(f, 'img.logo').length).toBe(0);
    expect(texto(f)).not.toContain('TIR');
    boton(f, '.pestana', 'Tendencia').click();
    await f.whenStable();
    expect(texto(f)).toContain('Periodo seleccionado: Año en curso (YTD)');
    expect(texto(f)).toContain('01/01/2026 - 12/11/2026');
  });
});

describe('nc-mon-comparacion', () => {
  it('pinta la tabla del periodo, abre el detalle y retira activos', async () => {
    const f = await montar(Comparacion, { activos: ACTIVOS_EXTERIOR_EJEMPLO, hoy: HOY_MONITOR });
    expect(texto(f)).toContain('Periodo seleccionado: Año en curso (YTD)');
    expect(todos(f, 'nc-mon-tabla tbody tr').length).toBe(6);
    expect(todos(f, 'nc-mon-item-comparacion').length).toBe(6);

    const quitados: string[] = [];
    f.componentInstance.quitar.subscribe((c) => quitados.push(c));
    todos(f, 'nc-mon-tabla .boton-fila')[0].click();
    expect(quitados.length).toBe(1);

    boton(f, 'nc-mon-tabla .valor', 'Paciente').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-detalle').length).toBe(1);
    expect(texto(f)).toContain('Mezcla Invest-ed PACIENTE');
  });

  it('cambia de periodo por el modelo y sin activos invita a seleccionar', async () => {
    const f = await montar(Comparacion, { activos: ACTIVOS_EXTERIOR_EJEMPLO, hoy: HOY_MONITOR });
    const lista = todos(f, 'nc-mon-seleccion select')[0] as HTMLSelectElement;
    lista.value = '1';
    lista.dispatchEvent(new Event('change'));
    expect(f.componentInstance.periodo()).toBe(1);

    f.componentRef.setInput('activos', [] as ActivoComparado[]);
    await f.whenStable();
    expect(texto(f)).toContain('¡Selecciona la información que quieras graficar!');
  });

  it('avisa los activos sin datos en el periodo', async () => {
    const sinPuntos = ACTIVOS_EXTERIOR_EJEMPLO.map((a, i) => (i === 0 ? { ...a, puntos: [], metricas: null } : a));
    const f = await montar(Comparacion, { activos: sinPuntos, hoy: HOY_MONITOR });
    expect(texto(f)).toContain('los siguientes fondos no presentan datos: FPV Strategist Conservador.');
  });
});

describe('nc-mon-grafica-contratos', () => {
  it('pinta los contratos de Óscar y, sin productos, el aviso', async () => {
    const f = await montar(GraficaContratos, { contratos: CONTRATOS_GRAFICA_EJEMPLO, hoy: HOY_MONITOR });
    expect(texto(f)).toContain('Comportamiento de los contratos');
    expect(texto(f)).toContain('Multifund 061');
    f.componentRef.setInput('sinProductos', true);
    await f.whenStable();
    expect(texto(f)).toContain('El cliente aún no tiene productos activos.');
  });
});

describe('listas de comparación', () => {
  it('referencias: filtra desactualizados y marca con un clic', async () => {
    const f = await montar(ListaReferencias, { companias: COMPANIAS_REFERENCIA, hoy: HOY_MONITOR });
    expect(todos(f, '.item').length).toBe(6);
    todos(f, '.casilla')[0].click();
    await f.whenStable();
    expect(todos(f, '.item').length).toBe(8);
    expect(todos(f, '.icono-alerta').length).toBe(2);
    todos(f, '.item')[0].click();
    await f.whenStable();
    expect(f.componentInstance.seleccionados()).toEqual([
      { idCompania: '1', idPortafolio: 'AA01', tipo: 'VOLUNTARIO' },
    ] as ReferenciaSeleccionada[]);
    expect(todos(f, '.item.activo').length).toBe(1);
  });

  it('mezclas: ordenadas por perfil y con selección', async () => {
    const f = await montar(ListaMezclas, { catalogo: MEZCLAS, vista: 'exterior' });
    expect(todos(f, '.item').map((b) => b.textContent?.trim())).toEqual([
      'Cauta',
      'Discreta',
      'Dinámica',
      'Paciente',
      'Audaz',
      'Decidida',
    ]);
    todos(f, '.item')[3].click();
    await f.whenStable();
    expect(f.componentInstance.seleccionadas()).toEqual([3]);
  });

  it('CDT: marca plazos y abre la información', async () => {
    const seleccion = signal<readonly string[]>([]);
    const f = await montar(ListaCdt, { plazos: PLAZOS_CDT });
    f.componentInstance.seleccionados.subscribe((s) => seleccion.set(s));
    expect(todos(f, '.item').map((b) => b.textContent?.trim())).toContain('A 30 Dias');
    todos(f, '.item')[2].click();
    expect(seleccion()).toEqual(['90']);
    todos(f, '.conoce-mas')[0].click();
    await f.whenStable();
    expect(texto(f)).toContain('Concepto clave: Media Móvil 4 Semanas');
    boton(f, '.regresar', 'Regresar').click();
    await f.whenStable();
    expect(texto(f)).not.toContain('Concepto clave');
    todos(f, '.conoce-mas')[0].click();
    await f.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await f.whenStable();
    expect(texto(f)).not.toContain('Concepto clave');
  });

  it('desempeño móvil a pantalla completa', async () => {
    const f = await montar(RendimientoMovil, { nombre: 'PACIENTE', periodos: DETALLE_MEZCLA_CLIENTE.desempeno });
    expect(todos(f, '.tarjeta').length).toBe(6);
    expect(texto(f)).toContain('Desempeño del fondo en diferentes periodos:');
  });
});
