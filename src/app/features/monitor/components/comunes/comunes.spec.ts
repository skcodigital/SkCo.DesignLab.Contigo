import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Casillas } from '@features/monitor/components/comunes/casillas/casillas';
import { Desplegable } from '@features/monitor/components/comunes/desplegable/desplegable';
import { PersonalizarColumnas } from '@features/monitor/components/comunes/personalizar-columnas/personalizar-columnas';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import { SelectorPeriodoMovil } from '@features/monitor/components/comunes/selector-periodo-movil/selector-periodo-movil';
import { SinDatos } from '@features/monitor/components/comunes/sin-datos/sin-datos';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { TarjetasRendimiento } from '@features/monitor/components/comunes/tarjetas-rendimiento/tarjetas-rendimiento';
import { GrupoCasillas, OpcionesTabla, RangoFechas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/** Pruebas de humo de las piezas comunes: que pinten y respondan (sin gráficas: ECharts necesita canvas). */

class ObservadorFalso {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function texto(f: ComponentFixture<unknown>): string {
  return (f.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function todos(f: ComponentFixture<unknown>, selector: string): HTMLElement[] {
  return Array.from((f.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(selector));
}

beforeAll(() => {
  globalThis.ResizeObserver ??= ObservadorFalso as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
});

describe('Tabla', () => {
  const opciones: OpcionesTabla = {
    claves: ['nombre', 'saldo'],
    etiquetas: ['Nombre', 'Saldo'],
    datos: [
      { nombre: 'Beta', saldo: 20 },
      { nombre: 'Alfa', saldo: 1000.5 },
      { nombre: 'Gamma', saldo: 5 },
    ],
    tiposColumna: ['texto', 'dinero'],
    ordenable: true,
    conPaginador: true,
    conAcciones: false,
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    coloresPunto: ['#a00', '#0a0', '#00a'],
  };

  async function crear(): Promise<ComponentFixture<Tabla>> {
    const f = TestBed.createComponent(Tabla);
    f.componentRef.setInput('opciones', opciones);
    f.componentRef.setInput('tamanoPagina', 2);
    await f.whenStable();
    return f;
  }

  it('pinta encabezados, celdas formateadas, puntos y paginador', async () => {
    const f = await crear();
    expect(todos(f, 'thead th').length).toBe(3);
    expect(todos(f, 'tbody tr').length).toBe(2);
    expect(texto(f)).toContain('$ 1,000.50');
    expect(todos(f, '.punto')[0].style.backgroundColor).toBe('rgb(170, 0, 0)');
    expect(todos(f, '.pagina').map((p) => p.textContent?.trim())).toEqual(['1', '2']);
  });

  it('ordena al hacer clic en el encabezado y vuelve a la página 1', async () => {
    const f = await crear();
    todos(f, 'th.ordenable')[1].click();
    await f.whenStable();
    expect(todos(f, 'tbody tr').map((tr) => tr.querySelector('.valor')?.textContent?.trim())).toEqual(['Gamma', 'Beta']);
  });
});

describe('SelectorFechas', () => {
  it('abre el calendario, marca inicio y fin, emite el rango y cierra', async () => {
    const f = TestBed.createComponent(SelectorFechas);
    f.componentRef.setInput('hoy', new Date(2026, 10, 12));
    const rangos: RangoFechas[] = [];
    f.componentInstance.rangoCambio.subscribe((r) => rangos.push(r));
    await f.whenStable();

    todos(f, 'input.campo')[0].click();
    await f.whenStable();
    expect(texto(f)).toContain('noviembre 2026');
    expect(todos(f, '.dia-semana')[0].textContent?.trim()).toBe('LU');

    const dia = (n: number): HTMLElement =>
      todos(f, 'nc-mon-calendario-mes')[0]
        .querySelectorAll<HTMLElement>('.dia-propio')
        .item(n - 1);
    dia(3).click();
    await f.whenStable();
    dia(10).click();
    await f.whenStable();

    expect(rangos).toEqual([{ inicio: '2026-11-03', fin: '2026-11-10' }]);
    expect(todos(f, '.calendario').length).toBe(0);
    expect((todos(f, 'input.campo')[0] as HTMLInputElement).value).toBe('2026-11-03 - 2026-11-10');
  });

  it('en el exterior los nombres van en inglés', async () => {
    const f = TestBed.createComponent(SelectorFechas);
    f.componentRef.setInput('hoy', new Date(2026, 10, 12));
    f.componentRef.setInput('vista', 'exterior');
    await f.whenStable();
    todos(f, 'input.campo')[0].click();
    await f.whenStable();
    expect(texto(f)).toContain('November 2026');
  });
});

describe('Desplegable', () => {
  it('arranca abierto en el cliente y cerrado en el exterior; alterna y avisa al abrir', async () => {
    const f = TestBed.createComponent(Desplegable);
    f.componentRef.setInput('titulo', 'Sección');
    let abiertas = 0;
    f.componentInstance.abierto.subscribe(() => abiertas++);
    await f.whenStable();
    expect(todos(f, '.colapsable.abierto').length).toBe(1);

    f.componentRef.setInput('vista', 'exterior');
    await f.whenStable();
    expect(todos(f, '.colapsable.abierto').length).toBe(0);

    todos(f, '.cabecera')[0].click();
    await f.whenStable();
    expect(todos(f, '.colapsable.abierto').length).toBe(1);
    expect(abiertas).toBe(1);
  });
});

@Component({
  imports: [Casillas],
  template: '<nc-mon-casillas [grupos]="grupo" [filtro]="filtro()" [(valores)]="valores" />',
})
class AnfitrionCasillas {
  readonly grupo: GrupoCasillas = {
    titulo: 'Columnas',
    opciones: [
      { nombre: 'Valor inicial', valor: 'inicial' },
      { nombre: 'Valor final', valor: 'final' },
      { nombre: 'TEA', valor: 'tea' },
    ],
  };
  readonly filtro = signal('');
  readonly valores = signal<ValoresCasillas>({ inicial: true });
}

describe('Casillas', () => {
  it('marca lo que viene en valores, filtra por nombre y actualiza el modelo', async () => {
    const f = TestBed.createComponent(AnfitrionCasillas);
    await f.whenStable();
    const casillas = todos(f, 'input.casilla') as HTMLInputElement[];
    expect(casillas.map((c) => c.checked)).toEqual([true, false, false]);

    casillas[2].click();
    await f.whenStable();
    expect(f.componentInstance.valores()).toEqual({ inicial: true, tea: true });

    f.componentInstance.filtro.set('valor');
    await f.whenStable();
    expect(todos(f, '.nombre').map((n) => n.textContent)).toEqual(['Valor inicial', 'Valor final']);
  });
});

describe('PersonalizarColumnas', () => {
  it('aplica lo marcado y deja siempre visibles las columnas fijas', async () => {
    const f = TestBed.createComponent(PersonalizarColumnas);
    f.componentRef.setInput('grupo', {
      opciones: [
        { nombre: '', valor: 'nombre' },
        { nombre: 'TEA', valor: 'tea' },
      ],
    });
    f.componentRef.setInput('siempreVisibles', ['nombre']);
    const aplicadas: ValoresCasillas[] = [];
    f.componentInstance.aplicar.subscribe((v) => aplicadas.push(v));
    await f.whenStable();

    todos(f, 'button.personalizar')[0].click();
    await f.whenStable();
    expect(todos(f, 'input.casilla').length).toBe(1);
    (todos(f, 'input.casilla')[0] as HTMLInputElement).click();
    await f.whenStable();
    todos(f, 'button.aplicar')[0].click();
    await f.whenStable();
    expect(aplicadas).toEqual([{ tea: false, nombre: true }]);
  });
});

describe('SelectorPeriodoMovil', () => {
  it('emite la píldora elegida y muestra el selector de fechas con «Personalizado»', async () => {
    const f = TestBed.createComponent(SelectorPeriodoMovil);
    const elegidos: number[] = [];
    f.componentInstance.seleccion.subscribe((v) => elegidos.push(v));
    await f.whenStable();
    expect(todos(f, '.pildora.activa')[0].textContent?.trim()).toBe('Últ. mes');

    todos(f, '.pildora')[2].click();
    expect(elegidos).toEqual([5]);

    f.componentRef.setInput('seleccionado', 10);
    await f.whenStable();
    expect(todos(f, 'nc-mon-selector-fechas').length).toBe(1);
  });
});

describe('TarjetasRendimiento y SinDatos', () => {
  it('formatea según la vista y marca subidas y bajadas', async () => {
    const f = TestBed.createComponent(TarjetasRendimiento);
    f.componentRef.setInput('datos', [{ periodo: 'Último mes', variacion: 1.5, volatilidad: -0.25, tea: 0, retorno: null }]);
    await f.whenStable();
    expect(texto(f)).toContain('1,50%');
    expect(texto(f)).toContain('-0,25%');
    expect(todos(f, '.flecha.sube').length).toBe(1);
    expect(todos(f, '.flecha.baja').length).toBe(1);

    f.componentRef.setInput('vista', 'exterior');
    await f.whenStable();
    expect(texto(f)).toContain('1.50%');
  });

  it('respeta los saltos de línea de la descripción', async () => {
    const f = TestBed.createComponent(SinDatos);
    f.componentRef.setInput('titulo', 'No hay datos');
    f.componentRef.setInput('descripcion', 'Primera línea\nSegunda línea');
    await f.whenStable();
    expect(todos(f, '.descripcion br').length).toBe(1);
    expect(texto(f)).toContain('Segunda línea');
  });
});
