import { Component, input, output, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AvisoStore } from '@core/state/aviso.store';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { GraficaLineasCompacta } from '@features/monitor/components/comunes/grafica-lineas-compacta/grafica-lineas-compacta';
import { GraficaLineas } from '@features/monitor/components/comunes/grafica-lineas/grafica-lineas';
import { GraficaTortaCompacta } from '@features/monitor/components/comunes/grafica-torta-compacta/grafica-torta-compacta';
import { GraficaRiesgoRetorno } from '@features/monitor/components/detalle/grafica-riesgo-retorno/grafica-riesgo-retorno';
import { GraficaTendencia } from '@features/monitor/components/detalle/grafica-tendencia/grafica-tendencia';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_EXTERIOR } from '@features/monitor/constants/textos-exterior';
import { MonitorExteriorPage } from '@features/monitor/pages/monitor-exterior-page/monitor-exterior-page';
import { MonitorExteriorStore } from '@features/monitor/stores/monitor-exterior.store';

/**
 * Prueba de humo de la página del Monitor exterior en jsdom: monta la página completa (con la comparación y el
 * detalle reales) y recorre sus interacciones. ECharts necesita canvas: la gráfica base se reemplaza por una vacía.
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

async function montar(estado?: string): Promise<ComponentFixture<MonitorExteriorPage>> {
  const f = TestBed.createComponent(MonitorExteriorPage);
  if (estado) {
    f.componentRef.setInput('estado', estado);
  }
  await f.whenStable();
  return f;
}

function store(f: ComponentFixture<MonitorExteriorPage>): MonitorExteriorStore {
  return f.debugElement.injector.get(MonitorExteriorStore);
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
  for (const c of [GraficaLineas, GraficaLineasCompacta, GraficaTortaCompacta, GraficaTendencia, GraficaRiesgoRetorno]) {
    TestBed.overrideComponent(c as Type<unknown>, { remove: { imports: [Grafica] }, add: { imports: [GraficaFalsa] } });
  }
});

describe('nc-monitor-exterior-page', () => {
  it('pinta migas, encabezado, «Selecciona y compara», la invitación a seleccionar y el aviso legal', async () => {
    const f = await montar();
    expect(texto(f)).toContain('Inicio /');
    expect(texto(f)).toContain('Análisis avanzado de portafolios y rendimiento.');
    expect(todos(f, 'a.miga')[0].getAttribute('href')).toBe('/inicio');
    expect(todos(f, 'nc-mon-panel-seleccion').length).toBe(1);
    expect(texto(f)).toContain('¡Selecciona la información que quieras graficar!');
    expect(texto(f)).toContain('Decreto 2555 de 2010');
  });

  it('marcar un portafolio lo grafica y lo pone en la tabla; quitarlo vuelve a empezar', async () => {
    const f = await montar();
    boton(f, 'nc-mon-lista-portafolios .item', 'FIC Skandia Efectivo').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-tabla-comparacion').length).toBe(1);
    expect(texto(f)).toContain('Periodo seleccionado: Año en curso (YTD)');

    store(f).quitar('FICEFECTIVO');
    await f.whenStable();
    expect(texto(f)).toContain('¡Selecciona la información que quieras graficar!');
  });

  it('el pantallazo y el Monitor antiguo muestran avisos del laboratorio', async () => {
    const f = await montar();
    const avisos = TestBed.inject(AvisoStore);
    todos(f, '.pantallazo')[0].click();
    expect(avisos.actual()?.texto).toBe(TEXTOS.sinDescargas);
    boton(f, '.monitor-antiguo', 'Monitor antiguo').click();
    expect(avisos.actual()?.texto).toBe(TEXTOS_EXTERIOR.sinMonitorAntiguo);
  });

  it('«Asistente» abre el panel del asistente y responde con un ejemplo', async () => {
    const f = await montar();
    boton(f, '.asistente', 'Asistente').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-asistente').length).toBe(1);
    expect(todos(f, '.asistente')[0].classList).toContain('oculto');

    boton(f, '.accion', 'Haz un análisis').click();
    await f.whenStable();
    expect(texto(f)).toContain('Escribiendo');
    store(f).responderAsistente();
    await f.whenStable();
    expect(texto(f)).toContain('📝 Resumen:');

    todos(f, 'nc-mon-asistente .cerrar')[0].click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-asistente').length).toBe(0);
  });

  it('con ?estado=ejemplo arranca con la selección marcada y la tabla llena', async () => {
    const f = await montar('ejemplo');
    expect(todos(f, 'nc-mon-tabla tbody tr').length).toBe(6);
    expect(todos(f, 'nc-mon-lista-portafolios .item.activo').length).toBe(2);
  });

  it('con ?estado=error pinta los errores de los servicios', async () => {
    const f = await montar('error');
    expect(todos(f, 'nc-mon-error-servicio').length).toBe(6);
    expect(texto(f)).toContain('Hemos tenido un problema al cargar este módulo.');
  });

  it('en móvil «Selecciona ahora» abre la modal de pantalla completa y «Graficar selección» grafica', async () => {
    movil = true;
    const f = await montar();
    boton(f, '.boton-selecciona', 'Selecciona ahora').click();
    await f.whenStable();
    const modal = todos(f, 'nc-mon-modal');
    expect(modal.length).toBe(1);

    const enModal = (selector: string) => Array.from(modal[0].querySelectorAll<HTMLElement>(selector));
    enModal('nc-mon-lista-portafolios .item').find((b) => b.textContent?.includes('FPV Strategist Moderado'))?.click();
    await f.whenStable();
    expect(store(f).activos()).toEqual([]);

    enModal('.graficar')[0].click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-modal').length).toBe(0);
    expect(store(f).activos().map((a) => a.clave)).toEqual(['FPVSTGMOD']);
  });
});
