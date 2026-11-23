import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TEXTOS } from '../../../constants/textos';
import { MESES_CORTOS, MESES_LARGOS, MIN_ANIO_LOGROS } from '../../../data/logros.mock';
import { MesAnio } from '../../../interfaces/logros';
import { esMesFuturo, siguienteHabilitado } from '../../../utils/logros';

const PASO_TECLA: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 };

/**
 * «Logros en <mes>»: selector de un solo mes (Figma Portal Contigo · Year Picker 43746:29739).
 * Los meses que aún no han cerrado no se pueden elegir. Grilla con foco itinerante y flechas.
 */
@Component({
  selector: 'nc-selector-mes',
  templateUrl: './selector-mes.html',
  styleUrl: './selector-mes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'clicFuera($event)' },
})
export class SelectorMes {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly seleccion = input.required<MesAnio>();
  /** Último mes cerrado: tope del selector. */
  readonly ultimo = input.required<MesAnio>();
  readonly elegir = output<MesAnio>();

  protected readonly minAnio = MIN_ANIO_LOGROS;
  protected readonly abierto = signal(false);
  /** Año que muestra la grilla (se navega con las flechas del encabezado). */
  protected readonly vista = linkedSignal(() => this.seleccion().anio);

  protected readonly texto = computed(() => `${MESES_LARGOS[this.seleccion().mes]} ${this.seleccion().anio}`);
  protected readonly meses = computed(() => {
    const anio = this.vista();
    const sel = this.seleccion();
    return MESES_CORTOS.map((corto, mes) => ({
      corto,
      aria: TEXTOS.logros.mesAria(MESES_LARGOS[mes], anio),
      marcado: sel.anio === anio && sel.mes === mes,
      deshabilitado: esMesFuturo(anio, mes, this.ultimo()),
    }));
  });
  /** Botón con tabindex=0: el mes elegido o, si no está en este año, el primero habilitado. */
  protected readonly foco = linkedSignal(() => {
    const meses = this.meses();
    const marcado = meses.findIndex((m) => m.marcado);
    return marcado >= 0 ? marcado : Math.max(0, meses.findIndex((m) => !m.deshabilitado));
  });

  private readonly disparador = viewChild.required<ElementRef<HTMLButtonElement>>('disparador');
  private readonly botones = viewChildren<ElementRef<HTMLButtonElement>>('mesBtn');

  protected alternar(): void {
    if (this.abierto()) this.cerrar(false);
    else this.abrir();
  }

  protected cambiarAnio(paso: number): void {
    this.vista.update((a) => a + paso);
  }

  protected elegirMes(mes: number): void {
    if (this.meses()[mes]?.deshabilitado) return;
    this.elegir.emit({ anio: this.vista(), mes });
    this.cerrar(true);
  }

  protected navegar(e: KeyboardEvent, desde: number): void {
    const paso = PASO_TECLA[e.key];
    if (!paso) return;
    e.preventDefault();
    const j = siguienteHabilitado(
      desde,
      paso,
      this.meses().map((m) => m.deshabilitado),
    );
    if (j < 0) return;
    this.foco.set(j);
    this.botones()[j]?.nativeElement.focus();
  }

  protected cerrar(devolverFoco: boolean): void {
    this.abierto.set(false);
    if (devolverFoco) this.disparador().nativeElement.focus();
  }

  protected clicFuera(e: MouseEvent): void {
    if (this.abierto() && !this.host.nativeElement.contains(e.target as Node)) this.cerrar(false);
  }

  private abrir(): void {
    this.vista.set(this.seleccion().anio);
    this.abierto.set(true);
    afterNextRender(() => this.botones()[this.foco()]?.nativeElement.focus(), { injector: this.injector });
  }
}
