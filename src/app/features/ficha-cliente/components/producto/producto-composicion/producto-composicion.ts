import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { SaldosOtrasFechas } from '@features/ficha-cliente/components/producto/saldos-otras-fechas/saldos-otras-fechas';
import { TEXTOS_FICHA } from '@features/ficha-cliente/constants/textos';
import { STANDING_ALLOCATION } from '@features/ficha-cliente/data/composicion.mock';
import { EstadoSaldos, SegmentoComposicion, VistaComposicion } from '@features/ficha-cliente/interfaces/composicion';
import { textoCopiaTabla } from '@features/ficha-cliente/utils/composicion';

const T = TEXTOS_FICHA;
const COPIADA_MS = 2000;

/**
 * "Composición y saldos": switch Composición / Standing allocation, Saldos a otras fechas, Indicadores por
 * portafolio (dona + tabla con total y Copiar tabla) y Standing allocation.
 */
@Component({
  selector: 'nc-producto-composicion',
  imports: [SaldosOtrasFechas],
  templateUrl: './producto-composicion.html',
  styleUrl: './producto-composicion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoComposicion {
  readonly vista = input.required<VistaComposicion>();
  readonly hoy = input.required<Date>();
  readonly minima = input.required<Date>();

  readonly elegirSegmento = output<SegmentoComposicion>();
  readonly elegirFechaCorte = output<Date>();
  readonly elegirEstado = output<EstadoSaldos>();
  /** El asesor usó "Saldos a otras fechas": apaga el aviso de novedad. */
  readonly usarNovedad = output<void>();

  private readonly aviso = inject(AvisoStore);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly saf = viewChild(SaldosOtrasFechas);
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly standing = STANDING_ALLOCATION;
  /** Alterna entre dos clases con la misma animación para reiniciarla en cada cambio de fecha. */
  protected readonly animacion = signal<0 | 1 | 2>(0);
  protected readonly copiada = signal(false);
  protected readonly textoCopiar = computed(() => (this.copiada() ? T.copiar.copiada : T.copiar.boton));
  protected readonly estadoCorte = computed(() =>
    this.vista().estado === 'proceso' ? T.composicion.enProceso : T.composicion.enEfectivo,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Desde el aviso de novedad: lleva a la caja de fecha (en escritorio la desplaza al centro). */
  enfocarFecha(desplazar: boolean): void {
    this.saf()?.enfocar(desplazar);
  }

  protected alElegirFecha(fecha: Date): void {
    this.elegirFechaCorte.emit(fecha);
    this.animacion.update((a) => (a === 1 ? 2 : 1));
  }

  /** Copia la tabla como texto separado por tabulaciones (se pega directo en Excel o en un correo). */
  protected async copiar(): Promise<void> {
    try {
      await this.ventana?.navigator.clipboard.writeText(textoCopiaTabla(this.vista()));
    } catch {
      this.aviso.mostrar(T.copiar.error);
      return;
    }
    this.copiada.set(true);
    this.aviso.mostrar(T.copiar.aviso);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copiada.set(false), COPIADA_MS);
  }
}
