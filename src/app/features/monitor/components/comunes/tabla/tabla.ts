import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { TablaAcciones } from '@features/monitor/components/comunes/tabla/tabla-acciones';
import { TablaIcono } from '@features/monitor/components/comunes/tabla/tabla-icono';
import { TablaPaginador } from '@features/monitor/components/comunes/tabla/tabla-paginador';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS } from '@features/monitor/constants/textos';
import {
  AccionTabla,
  Alineacion,
  ClaveAccionTabla,
  Estilos,
  EventoFila,
  FilaTabla,
  OpcionesTabla,
  TipoColumna,
  ValoresCasillas,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import {
  alineacionColumna,
  columnasTabla,
  filasDePagina,
  ordenarFilas,
  tamanosPagina,
  textoParaCopiar,
  tipoColumna,
  vistaFilas,
} from '@features/monitor/utils/tabla';

const T = TEXTOS.tabla;

/** Acciones predeterminadas del menú (en producción con íconos en imagen; Sami era un gif). */
const ACCIONES_PREDETERMINADAS: readonly (AccionTabla & { clave: ClaveAccionTabla })[] = [
  { clave: 'personalizar', nombre: T.personalizar, icono: 'lapiz', tooltip: T.personalizarTooltip },
  { clave: 'copiar', nombre: T.copiar, icono: 'copiar' },
  { clave: 'graficar', nombre: T.graficar, icono: 'grafica-linea', textoDeshabilitada: T.graficarDeshabilitada },
  {
    clave: 'analizarConSami',
    nombre: T.analizarConSami,
    icono: { imagen: 'assets/sami-cabeza.png' },
    textoDeshabilitada: T.analizarConSamiDeshabilitada,
  },
];

/**
 * Tabla completa del Monitor (`app-full-table`): ordenamiento por encabezado, íconos y tooltips por celda,
 * columna de puntos de color, acciones por fila, columna verde de acciones con menú, paginador y columnas
 * fijas al hacer scroll horizontal (`columnasFijas`, la directiva de la página del Monitor del cliente).
 *
 * Diferencias entre vistas: el cliente muestra los porcentajes con hasta 3 decimales, resalta en azul los
 * encabezados con tooltip (ancho de 400px) y copia los números sin formato; el exterior usa 2 decimales, corta
 * el texto largo con «…» y copia con 2 decimales. `variante="portafolios"` aplica los estilos de la tabla de
 * portafolios del cliente (bordes, título «Portafolio» sobre los puntos y fondo de las columnas fijas).
 */
@Component({
  selector: 'nc-mon-tabla',
  imports: [Icono, TablaAcciones, TablaIcono, TablaPaginador, Tooltip],
  templateUrl: './tabla.html',
  styleUrl: './tabla.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.vista-cliente]': "vista() === 'cliente'",
    '[class.variante-portafolios]': "variante() === 'portafolios'",
  },
})
export class Tabla {
  readonly opciones = input.required<OpcionesTabla>();
  readonly tamanoPagina = input(5);
  readonly tamanosPagina = input<readonly number[]>([5, 10, 20, 100]);
  readonly vista = input<VistaMonitor>('cliente');
  /** Cuántas columnas iniciales quedan fijas al hacer scroll horizontal (sobre 576px). */
  readonly columnasFijas = input(0);
  readonly variante = input<'base' | 'portafolios'>('base');

  /** Flecha de la columna verde de acciones. */
  readonly irAFila = output<FilaTabla>();
  /** Clic en una celda de tipo `accion`. */
  readonly accionCelda = output<EventoFila>();
  /** Botón de acción de una fila (p. ej. retirar). */
  readonly accionFila = output<EventoFila>();
  /** Acción del menú: `analizarConSami` o una de `accionesPropias` («Copiar tabla» la resuelve la tabla). */
  readonly accion = output<string>();
  readonly columnasVisiblesCambio = output<ValoresCasillas>();

  private readonly avisos = inject(AvisoStore);
  protected readonly textos = T;

  /** Producción alterna el sentido en cada clic, sin importar la columna. */
  private ascendente = false;
  protected readonly filas = linkedSignal<FilaTabla[]>(() => [...this.opciones().datos]);
  protected readonly pagina = linkedSignal({ source: this.opciones, computation: () => 1 });
  protected readonly tamano = linkedSignal(() => this.tamanoPagina());
  protected readonly visibles = linkedSignal<ValoresCasillas | null>(() => this.opciones().columnasVisibles ?? null);
  protected readonly menuAbierto = signal(false);
  protected readonly personalizarAbierto = signal(false);

  protected readonly columnas = computed(() => columnasTabla(this.opciones(), this.visibles()));
  protected readonly totalPaginas = computed(() => Math.ceil(this.filas().length / this.tamano()));
  protected readonly tamanos = computed(() => tamanosPagina(this.tamanosPagina(), this.opciones().datos.length));

  protected readonly filasVista = computed(() => {
    const o = this.opciones();
    const filas = filasDePagina(this.filas(), this.pagina(), this.tamano(), o.conPaginador);
    return vistaFilas(o, filas, this.columnas().datos, this.vista());
  });

  protected readonly acciones = computed<AccionTabla[]>(() => {
    const o = this.opciones();
    return [
      ...ACCIONES_PREDETERMINADAS.filter((a) => !o.ocultarAccionesPredeterminadas?.[a.clave]),
      ...(o.accionesPropias ?? []),
    ];
  });

  // ── Columnas fijas: se mide el ancho real de los encabezados (el contenido es variable) ──
  private readonly tablaEl = viewChild<ElementRef<HTMLTableElement>>('tabla');
  private readonly encabezados = viewChildren<ElementRef<HTMLTableCellElement>>('encabezado');
  protected readonly fijas = signal<readonly { left: number; width: number }[]>([]);

  constructor() {
    const observador = new ResizeObserver(() => this.medirFijas());
    afterRenderEffect(() => {
      this.filasVista();
      this.encabezados();
      const tabla = this.tablaEl()?.nativeElement;
      observador.disconnect();
      if (tabla && this.columnasFijas()) {
        observador.observe(tabla);
      }
      this.medirFijas();
    });
    inject(DestroyRef).onDestroy(() => observador.disconnect());
  }

  protected tipo(i: number): TipoColumna | undefined {
    return tipoColumna(this.opciones(), i);
  }

  protected alineacion(i: number): Alineacion | null {
    return alineacionColumna(this.opciones(), i);
  }

  protected estilo(mapa: Readonly<Record<string, Estilos>> | undefined, clave: string): Estilos | null {
    return mapa?.[clave] ?? null;
  }

  /** El tooltip del encabezado no aparece si su ícono ya tiene uno. */
  protected tooltipEncabezado(i: number): string {
    const o = this.opciones();
    return o.tooltipsIconosEncabezado?.[i] ? '' : (o.tooltipsEncabezado?.[i] ?? '');
  }

  protected fija(posicion: number): { left: number; width: number } | null {
    return posicion < this.columnasFijas() ? (this.fijas()[posicion] ?? null) : null;
  }

  protected ordenar(i: number): void {
    const o = this.opciones();
    if (!o.ordenable) {
      return;
    }
    this.ascendente = !this.ascendente;
    this.filas.set(ordenarFilas(this.filas(), o.claves[i], this.tipo(i), this.ascendente));
    this.pagina.set(1);
  }

  protected cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(1);
  }

  protected irPagina(p: number): void {
    this.pagina.set(Math.min(Math.max(1, p), this.totalPaginas()));
  }

  /** Clic en la columna verde: abre o cierra el menú, salvo que el clic venga de adentro de un popover. */
  protected alClicAcciones(e: MouseEvent): void {
    if (!(e.target as Element | null)?.closest('nc-mon-popover')) {
      this.menuAbierto.update((a) => !a);
    }
  }

  protected ejecutar(clave: string): void {
    if (clave === 'copiar') {
      this.copiarTabla();
    } else if (clave !== 'graficar') {
      this.accion.emit(clave);
    }
  }

  protected aplicarColumnas(columnas: ValoresCasillas): void {
    this.visibles.set(columnas);
    this.columnasVisiblesCambio.emit(columnas);
  }

  protected celdaAccion(clave: string, i: number, fila: FilaTabla): void {
    if (this.tipo(i) === 'accion') {
      this.accionCelda.emit({ clave, fila });
    }
  }

  /** Copia la página visible al portapapeles separada por tabuladores (para pegar en Excel). */
  copiarTabla(): void {
    this.menuAbierto.set(false);
    const o = this.opciones();
    const datos = this.columnas().datos;
    const encabezados = datos.map((c) => (o.encabezadosOcultos?.includes(c.clave) ? '' : o.etiquetas[c.indice]));
    const filas = this.filasVista().map((f) =>
      f.celdas.map((c) => (c.subtitulo ? `${c.texto}\n${c.subtitulo}` : c.texto)),
    );
    const texto = textoParaCopiar(encabezados, filas, datos.map((c) => this.tipo(c.indice)), this.vista());
    navigator.clipboard
      ?.writeText(texto)
      .then(() => this.avisos.mostrar(T.copiada))
      .catch(() => undefined);
  }

  /** Abre el popover «Personalizar» de la columna de acciones. */
  personalizar(): void {
    this.menuAbierto.set(false);
    this.personalizarAbierto.set(true);
  }

  private medirFijas(): void {
    const n = this.columnasFijas();
    if (!n) {
      return;
    }
    let acumulado = 0;
    const medidas = this.encabezados()
      .slice(0, n)
      .map((c) => {
        const width = c.nativeElement.getBoundingClientRect().width;
        const medida = { left: acumulado, width };
        acumulado += width;
        return medida;
      });
    const actuales = this.fijas();
    const iguales =
      medidas.length === actuales.length &&
      medidas.every((m, i) => m.left === actuales[i].left && m.width === actuales[i].width);
    // Tabla oculta o sin pintar (ancho 0): no apilar todo en 0, esperar al próximo cambio de tamaño.
    if (acumulado && !iguales) {
      this.fijas.set(medidas);
    }
  }
}
