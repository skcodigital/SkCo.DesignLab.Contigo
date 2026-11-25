import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Asistente } from '@features/monitor/components/exterior/asistente/asistente';
import { DivisasIndicadores } from '@features/monitor/components/exterior/divisas-indicadores/divisas-indicadores';
import { ListaPortafolios } from '@features/monitor/components/exterior/lista-portafolios/lista-portafolios';
import { PanelSeleccion } from '@features/monitor/components/exterior/panel-seleccion/panel-seleccion';
import { HOY_MONITOR, PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import { CATALOGO_EXTERIOR, PORTAFOLIOS_LISTA, SELECCION_EJEMPLO } from '@features/monitor/data/exterior-catalogos.mock';
import { IndicadorSeleccionado, SeleccionExterior } from '@features/monitor/interfaces/exterior';

/** Pruebas de humo de las piezas propias del Monitor exterior en jsdom. */

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

async function montar<T>(tipo: Type<T>, entradas: Record<string, unknown> = {}): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent(tipo);
  Object.entries(entradas).forEach(([k, v]) => f.componentRef.setInput(k, v));
  await f.whenStable();
  return f;
}

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
});

describe('nc-mon-lista-portafolios', () => {
  it('lista los portafolios vigentes, marca con un clic y muestra los desactualizados con el interruptor', async () => {
    const f = await montar(ListaPortafolios, { portafolios: PORTAFOLIOS_LISTA, hoy: HOY_MONITOR });
    expect(todos(f, '.item').length).toBe(PORTAFOLIOS_LISTA.length - 2);

    let marcados: readonly string[] = [];
    f.componentInstance.seleccionados.subscribe((s) => (marcados = s));
    boton(f, '.item', 'FIC Skandia Efectivo').click();
    await f.whenStable();
    expect(marcados).toEqual(['FICEFECTIVO']);
    expect(boton(f, '.item', 'FIC Skandia Efectivo').classList).toContain('activo');

    (todos(f, '.casilla')[0] as HTMLInputElement).click();
    await f.whenStable();
    expect(todos(f, '.item').length).toBe(PORTAFOLIOS_LISTA.length);
    expect(todos(f, '.icono-alerta').length).toBe(2);
  });

  it('filtra por clasificación y dice «Lo sentimos» si la búsqueda no coincide', async () => {
    const f = await montar(ListaPortafolios, { portafolios: PORTAFOLIOS_LISTA, hoy: HOY_MONITOR });
    const lista = todos(f, 'nc-mon-seleccion select')[0] as HTMLSelectElement;
    lista.value = 'Liquidez';
    lista.dispatchEvent(new Event('change'));
    await f.whenStable();
    expect(todos(f, '.item').length).toBe(3);

    const campo = todos(f, 'nc-mon-buscador input')[0] as HTMLInputElement;
    campo.value = 'xyz';
    campo.dispatchEvent(new KeyboardEvent('keyup'));
    await f.whenStable();
    expect(texto(f)).toContain('Lo sentimos');
    expect(texto(f)).toContain('"xyz" no coincide con ningún resultado.');
  });

  it('pinta el error del servicio', async () => {
    const f = await montar(ListaPortafolios, { portafolios: PORTAFOLIOS_LISTA, conError: true });
    expect(todos(f, 'nc-mon-error-servicio').length).toBe(1);
    expect(todos(f, '.item').length).toBe(0);
  });
});

describe('nc-mon-divisas-indicadores', () => {
  it('las divisas son una grilla que marca con un clic', async () => {
    const f = await montar(DivisasIndicadores, { modo: 'divisas', catalogo: CATALOGO_EXTERIOR.indicadores });
    expect(todos(f, '.item').map((i) => i.textContent?.trim())).toEqual(['Dólar', 'Euro', 'Libra esterlina', 'Yen']);
    let marcados: readonly IndicadorSeleccionado[] = [];
    f.componentInstance.seleccionados.subscribe((s) => (marcados = s));
    boton(f, '.item', 'Euro').click();
    expect(marcados).toEqual([{ tipo: 'divisa', clave: 'EUR' }]);
  });

  it('los indicadores tienen las pestañas Económicos y CDTs', async () => {
    const f = await montar(DivisasIndicadores, {
      modo: 'indicadores',
      catalogo: CATALOGO_EXTERIOR.indicadores,
      plazos: PLAZOS_CDT,
    });
    expect(texto(f)).toContain('Nuevo');
    expect(todos(f, '.item')[0].textContent?.trim()).toBe('Inflación');

    boton(f, '.pestana', 'CDTs').click();
    await f.whenStable();
    expect(todos(f, 'nc-mon-lista-cdt').length).toBe(1);
    let cdts: readonly string[] = [];
    f.componentInstance.cdts.subscribe((c) => (cdts = c));
    boton(f, 'nc-mon-lista-cdt .item', '90').click();
    expect(cdts).toEqual(['90']);
  });

  it('con error, las divisas y los indicadores económicos pintan el error', async () => {
    const divisas = await montar(DivisasIndicadores, { modo: 'divisas', conError: true });
    expect(todos(divisas, 'nc-mon-error-servicio').length).toBe(1);
    const indicadores = await montar(DivisasIndicadores, { modo: 'indicadores', conError: true });
    expect(todos(indicadores, '.pestana').length).toBe(2);
    expect(todos(indicadores, 'nc-mon-error-servicio').length).toBe(1);
  });
});

describe('nc-mon-panel-seleccion', () => {
  it('pinta las cinco secciones con Portafolios SK abierto y avisa cada cambio', async () => {
    const f = await montar(PanelSeleccion, { hoy: HOY_MONITOR });
    expect(texto(f)).toContain('Antes de comparar...');
    expect(todos(f, 'nc-mon-desplegable > .contenido p.titulo').map((t) => t.textContent?.trim())).toEqual([
      'Portafolios SK',
      'Mezclas Invest-ed',
      'Competencia',
      'Divisas',
      'Indicadores',
    ]);
    expect(texto(f)).toContain('Beta');
    expect(todos(f, '.restablecer')[0].classList).toContain('deshabilitado');

    const cambios: Partial<SeleccionExterior>[] = [];
    f.componentInstance.cambio.subscribe((c) => cambios.push(c));
    boton(f, 'nc-mon-lista-portafolios .item', 'FPV Strategist Moderado').click();
    expect(cambios).toEqual([{ portafolios: ['FPVSTGMOD'] }]);
  });

  it('con selección habilita restablecer; plegado solo muestra el botón para abrir', async () => {
    const f = await montar(PanelSeleccion, { seleccion: SELECCION_EJEMPLO });
    let restablecido = false;
    f.componentInstance.restablecer.subscribe(() => (restablecido = true));
    todos(f, '.restablecer')[0].click();
    expect(restablecido).toBe(true);

    f.componentRef.setInput('abierto', false);
    await f.whenStable();
    expect(todos(f, '.abrir').length).toBe(1);
    expect(todos(f, 'nc-mon-desplegable').length).toBe(0);
    expect((todos(f, '.lateral')[0] as HTMLElement).style.width).toBe('0px');
  });

  it('en la modal ocupa todo el ancho y suma «Graficar selección» y «Salir»', async () => {
    const f = await montar(PanelSeleccion, { modal: true, abierto: false });
    expect((todos(f, '.lateral')[0] as HTMLElement).style.width).toBe('100%');
    expect((todos(f, '.graficar')[0] as HTMLButtonElement).disabled).toBe(true);
    let salio = false;
    f.componentInstance.salir.subscribe(() => (salio = true));
    boton(f, '.salir', 'Salir').click();
    expect(salio).toBe(true);
  });
});

describe('nc-mon-asistente', () => {
  it('da la bienvenida y una acción rápida envía su texto', async () => {
    const f = await montar(Asistente);
    expect(texto(f)).toContain('Hola, ¿qué quieres hacer hoy?');
    expect(todos(f, '.accion').length).toBe(3);
    const enviados: string[] = [];
    f.componentInstance.enviar.subscribe((t) => enviados.push(t));
    boton(f, '.accion', 'Grafica portafolios').click();
    expect(enviados).toEqual(['Grafica portafolios o indicadores']);
  });

  it('Enter envía lo escrito y la conversación muestra «Escribiendo»', async () => {
    const f = await montar(Asistente);
    const enviados: string[] = [];
    f.componentInstance.enviar.subscribe((t) => enviados.push(t));
    const campo = todos(f, 'textarea')[0] as HTMLTextAreaElement;
    campo.value = 'Grafica el dólar';
    campo.dispatchEvent(new Event('input'));
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(enviados).toEqual(['Grafica el dólar']);

    f.componentRef.setInput('mensajes', [{ id: 1, remitente: 'usuario', texto: 'Grafica el dólar' }]);
    f.componentRef.setInput('escribiendo', true);
    await f.whenStable();
    expect(todos(f, '.burbuja-usuario').length).toBe(1);
    expect(texto(f)).toContain('Escribiendo');
    expect((todos(f, 'textarea')[0] as HTMLTextAreaElement).disabled).toBe(true);
  });
});
