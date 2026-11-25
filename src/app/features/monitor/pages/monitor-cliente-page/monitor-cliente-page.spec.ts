import { Component, input, output, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AvisoStore } from '@core/state/aviso.store';
import { Transacciones } from '@features/monitor/components/cliente/transacciones/transacciones';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { GraficaLineasCompacta } from '@features/monitor/components/comunes/grafica-lineas-compacta/grafica-lineas-compacta';
import { GraficaLineas } from '@features/monitor/components/comunes/grafica-lineas/grafica-lineas';
import { GraficaTortaCompacta } from '@features/monitor/components/comunes/grafica-torta-compacta/grafica-torta-compacta';
import { GraficaTorta } from '@features/monitor/components/comunes/grafica-torta/grafica-torta';
import { GraficaTendencia } from '@features/monitor/components/detalle/grafica-tendencia/grafica-tendencia';
import { TEXTOS } from '@features/monitor/constants/textos';
import { MonitorClientePage } from '@features/monitor/pages/monitor-cliente-page/monitor-cliente-page';

/**
 * Prueba de humo de la página del Monitor del cliente en jsdom: monta la página con los datos de Óscar y recorre
 * las pestañas, «Comparar», el visor de transacciones, las descargas y los escenarios del laboratorio. ECharts
 * necesita canvas: la gráfica base se reemplaza por una vacía con las mismas entradas.
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

async function montar(estado?: string): Promise<ComponentFixture<MonitorClientePage>> {
  const f = TestBed.createComponent(MonitorClientePage);
  if (estado) {
    f.componentRef.setInput('estado', estado);
  }
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
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  for (const c of [GraficaLineas, GraficaTorta, GraficaLineasCompacta, GraficaTortaCompacta, GraficaTendencia, Transacciones]) {
    TestBed.overrideComponent(c as Type<unknown>, { remove: { imports: [Grafica] }, add: { imports: [GraficaFalsa] } });
  }
});

describe('nc-monitor-cliente-page', () => {
  it('abre en Contratos con los contratos de Óscar', async () => {
    const f = await montar();
    expect(texto(f)).toContain('visualizarás únicamente los productos MFUND y FICS');
    expect(texto(f)).toContain('01/ene/2026 - 12/nov/2026');
    expect(texto(f)).toContain('Comportamiento de los contratos');
    expect(texto(f)).toContain('Indicadores por contrato');
    expect(texto(f)).toContain('Fecha seleccionada: Año en curso (YTD)');
    expect(texto(f)).toContain('Decreto 2555 de 2010');
    const filas = todos(f, 'nc-mon-seccion-indicadores tbody tr');
    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain('Fondo Voluntario de... Multifund | 100000063061');
    expect(todos(f, '.acciones-movil').length).toBe(0);
  });

  it('el nombre de un contrato lleva a la ficha del producto', async () => {
    const f = await montar();
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    boton(f, 'nc-mon-seccion-indicadores .valor', 'Efectivo | 301000052847').click();
    expect(navegar).toHaveBeenCalledWith(['/', 'ficha', 'producto'], { queryParams: { tipo: 'fic' } });
  });

  it('Portafolios: tabla, fecha de corte, transacciones y descarga del informe', async () => {
    const f = await montar();
    boton(f, 'nc-mon-cambio-vista button', 'Portafolios').click();
    await f.whenStable();
    expect(texto(f)).not.toContain('visualizarás únicamente los productos MFUND y FICS');
    expect(texto(f)).toContain('Indicadores por portafolio');
    expect(texto(f)).toContain('Indicadores de posición — foto actual del cliente');
    expect(texto(f)).toContain('Fecha de corte: 12/11/2026');
    expect(todos(f, 'nc-mon-seccion-indicadores tbody tr').length).toBe(7);
    expect(todos(f, 'nc-mon-filtro-portafolios').length).toBe(1);

    todos(f, 'nc-mon-seccion-indicadores .boton-fila')[0].click();
    expect(TestBed.inject(AvisoStore).actual()?.texto).toBe(TEXTOS.sinDescargas);

    const pildora = todos(f, 'nc-mon-seccion-indicadores .valor').find((e) => e.textContent?.trim() === '15');
    pildora?.click();
    await f.whenStable();
    expect(texto(f)).toContain('Comportamiento del portafolio: FIC Skandia Efectivo');
    expect(texto(f)).toContain('VUPC:');
    expect(todos(f, 'nc-mon-transacciones tbody tr').length).toBe(15);
    boton(f, 'nc-mon-transacciones .texto-devoluciones', 'Ocultar devoluciones');
    todos(f, 'nc-mon-transacciones .devoluciones .casilla')[0].click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-transacciones tbody tr').length).toBe(14);
    todos(f, 'nc-mon-transacciones .cerrar')[0].click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-transacciones').length).toBe(0);

    boton(f, 'nc-mon-seccion-indicadores .valor', 'FIC Skandia Efectivo').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-detalle').length).toBe(1);
    expect(texto(f)).toContain('TIR');
  });

  it('«Comparar»: marca una mezcla, la aplica y la retira desde la tabla', async () => {
    const f = await montar();
    boton(f, 'nc-mon-boton-comparar .comparar', 'Comparar').click();
    await f.whenStable();
    expect(texto(f)).toContain('Antes de comparar...');
    expect(texto(f)).toContain('Selecciona y compara');
    boton(f, 'nc-mon-lista-mezclas .item', 'Paciente').click();
    await f.whenStable();
    boton(f, 'nc-mon-panel-comparar .aplicar', 'Aplicar').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-panel-comparar').length).toBe(0);
    expect(texto(f)).toContain('Mezcla Invest-ed');
    expect(todos(f, 'nc-mon-seccion-comparados tbody tr').length).toBe(1);

    boton(f, 'nc-mon-seccion-comparados .valor', 'Paciente').click();
    await f.whenStable();
    expect(texto(f)).toContain('Mezcla Invest-ed PACIENTE');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await f.whenStable();
    expect(todos(f, 'nc-mon-detalle').length).toBe(0);

    todos(f, 'nc-mon-seccion-comparados .boton-fila')[0].click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-seccion-comparados').length).toBe(0);
  });

  it('el pantallazo muestra el aviso de descargas', async () => {
    const f = await montar();
    todos(f, '.boton-pantallazo')[0].click();
    expect(TestBed.inject(AvisoStore).actual()?.texto).toBe(TEXTOS.sinDescargas);
  });

  it('en móvil el periodo y «Comparar» bajan debajo de la torta', async () => {
    movil = true;
    const f = await montar();
    expect(todos(f, '.acciones-movil nc-mon-acciones-periodo').length).toBe(1);
    expect(todos(f, '.acciones-movil nc-mon-boton-comparar').length).toBe(1);
    expect(texto(f)).toContain('en la versión de escritorio');
  });

  it('?estado=error pinta el error de los módulos y ?estado=sin-datos el aviso de la gráfica', async () => {
    const error = await montar('error');
    expect(todos(error, 'nc-mon-error-servicio').length).toBe(2);
    expect(todos(error, 'nc-mon-seccion-indicadores').length).toBe(0);
    error.destroy();

    const vacio = await montar('sin-datos');
    expect(texto(vacio)).toContain('El cliente aún no tiene portafolios activos.');
    expect(todos(vacio, 'nc-mon-seccion-indicadores tbody tr').length).toBe(0);
  });
});
