import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS } from '@features/monitor/constants/textos';
import { SerieLeyenda, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { capitalizar } from '@features/monitor/utils/formatos';

/**
 * Leyenda propia de las gráficas (`custom-chart-legend`): un chip por serie que la oculta o muestra, «x» para
 * retirar los activos agregados con «Comparar» y flechas de desplazamiento cuando los chips no caben.
 *
 * Diferencias entre vistas (`vista`): en el cliente la leyenda solo aparece si alguna serie tiene nombre y el
 * texto va tal cual (`nombreVisible ?? nombreProducto ?? nombre`); en el exterior siempre aparece, con más margen
 * arriba, letra Open Sans y el texto capitalizado (salvo `sinCapitalizar`).
 */
@Component({
  selector: 'nc-mon-leyenda-grafica',
  imports: [Icono, Tooltip],
  templateUrl: './leyenda-grafica.html',
  styleUrl: './leyenda-grafica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.vista-exterior]': "vista() === 'exterior'",
    '(window:resize)': 'revisarDesborde()',
  },
})
export class LeyendaGrafica {
  readonly series = input<readonly SerieLeyenda[]>([]);
  /** Visibilidad de cada serie por `nombre` (sin entrada = oculta, como producción). */
  readonly activas = input<Readonly<Record<string, boolean>>>({});
  /** La sección que contiene la gráfica está visible (el exterior vuelve a medir al mostrarse). */
  readonly visible = input(true);
  readonly vista = input<VistaMonitor>('cliente');

  readonly alternar = output<string>();
  readonly quitar = output<string>();

  protected readonly textoRetirar = TEXTOS.leyenda.retirar;
  protected readonly mostrarFlechas = signal(false);
  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedor');

  protected readonly conSeries = computed(
    () => this.vista() === 'exterior' || this.series().some((s) => !!s.nombre),
  );
  private readonly hayCdt = computed(() => this.series().some((s) => s.tipo === 'cdt'));

  constructor() {
    const observador = new ResizeObserver(() => this.revisarDesborde());
    afterRenderEffect(() => {
      this.series();
      this.visible();
      const el = this.contenedor()?.nativeElement;
      if (el) {
        observador.disconnect();
        observador.observe(el);
      }
      this.revisarDesborde();
    });
    afterNextRender(() => this.revisarDesborde());
    inject(DestroyRef).onDestroy(() => observador.disconnect());
  }

  protected texto(s: SerieLeyenda): string {
    if (this.vista() === 'cliente') {
      return s.nombreVisible ?? s.nombreProducto ?? s.nombre;
    }
    const texto = s.nombreVisible ?? s.nombre;
    return s.sinCapitalizar ? texto : capitalizar(texto);
  }

  /** Tooltip del chip: nota de normalización CDT/DTF o el nombre de la compañía. */
  protected tooltip(s: SerieLeyenda): string | null {
    if (s.removible && s.tipo !== 'cdt' && this.hayCdt()) {
      return TEXTOS.normalizacionCdt.tooltip;
    }
    return s.compania ? capitalizar(s.compania) : null;
  }

  protected desplazar(px: number): void {
    this.contenedor()?.nativeElement.scrollBy({ left: px, behavior: 'smooth' });
  }

  protected rueda(e: WheelEvent): void {
    e.preventDefault();
    this.desplazar(e.deltaY);
  }

  protected retirar(nombre: string, e: MouseEvent): void {
    e.stopPropagation();
    // Con el chip deshabilitado (serie oculta) la «x» no hace nada.
    if (this.activas()[nombre]) {
      this.quitar.emit(nombre);
    }
  }

  protected revisarDesborde(): void {
    const el = this.contenedor()?.nativeElement;
    this.mostrarFlechas.set(!!el && el.scrollWidth > el.clientWidth);
  }
}
