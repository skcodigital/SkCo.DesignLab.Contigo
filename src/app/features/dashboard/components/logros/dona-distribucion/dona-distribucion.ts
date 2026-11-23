import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TEXTOS } from '../../../constants/textos';
import { SegmentoDistribucion } from '../../../interfaces/logros';
import { anguloDesdeCentro, gradienteConico, puntoMedioSegmento, segmentoDeAngulo } from '../../../utils/logros';

/** Radio del hueco central de la dona (el anillo va de aquí al borde). */
const RADIO_HUECO = 36;

interface TooltipDona {
  indice: number;
  x: number;
  y: number;
}

/**
 * «Distribución de tus clientes totales»: dona con tooltip según el color (hover sobre el anillo o toque;
 * con teclado, las flechas recorren los segmentos). La leyenda resalta el segmento activo.
 */
@Component({
  selector: 'article[nc-dona-distribucion]',
  templateUrl: './dona-distribucion.html',
  styleUrl: './dona-distribucion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.resalta]': 'tooltip() !== null' },
})
export class DonaDistribucion {
  readonly segmentos = input.required<readonly SegmentoDistribucion[]>();

  protected readonly tooltip = signal<TooltipDona | null>(null);
  protected readonly activo = computed(() => {
    const t = this.tooltip();
    return t ? this.segmentos()[t.indice] : null;
  });
  protected readonly textoTooltip = computed(() => {
    const s = this.activo();
    return s ? TEXTOS.logros.donaTooltip(s.porcentaje) : '';
  });
  protected readonly fondo = computed(() => gradienteConico(this.segmentos()));
  protected readonly aria = computed(() =>
    this.segmentos()
      .map((s) => `${s.porcentaje} % ${s.nombre}`)
      .join(', '),
  );
  private readonly porcentajes = computed(() => this.segmentos().map((s) => s.porcentaje));
  /** Segmento recorrido con teclado (-1 = ninguno todavía). */
  private teclado = -1;

  protected moverPuntero(e: MouseEvent): void {
    const punto = this.puntoEnAnillo(e);
    if (!punto) {
      this.ocultar();
      return;
    }
    this.mostrar(segmentoDeAngulo(punto.angulo, this.porcentajes()), punto.x, punto.y);
  }

  protected clic(e: MouseEvent): void {
    const punto = this.puntoEnAnillo(e);
    if (punto) this.mostrar(segmentoDeAngulo(punto.angulo, this.porcentajes()), punto.x, punto.y);
  }

  protected tecla(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.porTeclado(this.teclado + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.porTeclado(this.teclado - 1);
    } else if (e.key === 'Escape') {
      this.ocultar();
    }
  }

  protected porTeclado(i: number): void {
    const n = this.segmentos().length;
    this.teclado = (i + n) % n;
    const { x, y } = puntoMedioSegmento(this.teclado, this.porcentajes());
    this.mostrar(this.teclado, x, y);
  }

  protected ocultar(): void {
    this.tooltip.set(null);
  }

  private mostrar(indice: number, x: number, y: number): void {
    this.tooltip.set({ indice, x, y });
  }

  /** Posición del puntero relativa a la dona, solo si cae sobre el anillo de color. */
  private puntoEnAnillo(e: MouseEvent): { x: number; y: number; angulo: number } | null {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const dx = x - r.width / 2;
    const dy = y - r.height / 2;
    const d = Math.hypot(dx, dy);
    if (d < RADIO_HUECO || d > r.width / 2) return null;
    return { x, y, angulo: anguloDesdeCentro(dx, dy) };
  }
}
