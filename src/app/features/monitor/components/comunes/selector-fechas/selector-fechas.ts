import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { CalendarioMes } from '@features/monitor/components/comunes/selector-fechas/calendario-mes';
import { TEXTOS } from '@features/monitor/constants/textos';
import { FormatoRegional, RangoFechas, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { aIso, compararDias, desdeIso, NOMBRES_CALENDARIO } from '@features/monitor/utils/fechas';

/** Mes visible (0–11) de un año. */
interface MesVisible {
  anio: number;
  mes: number;
}

/** Años hacia atrás que ofrece el selector de año (el mínimo por defecto de ng-bootstrap). */
const ANIOS_ATRAS = 10;

/**
 * Selector de rango de fechas (`app-datepicker`, un `ngbDatepicker` de rango): campo de 160px que abre un
 * calendario de dos meses (uno en móvil) hasta `hoy`. El primer clic marca el inicio, el segundo (posterior)
 * el fin, emite el rango y cierra. Se cierra también con un clic por fuera.
 *
 * Los nombres de meses y días siguen la configuración regional de cada vista (español en el cliente, inglés en
 * el exterior), como hacía ng-bootstrap.
 */
@Component({
  selector: 'nc-mon-selector-fechas',
  imports: [CalendarioMes],
  templateUrl: './selector-fechas.html',
  styleUrl: './selector-fechas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'alClicDocumento($event)' },
})
export class SelectorFechas {
  /** Rango con el que se pinta el campo (solo se aplica si trae inicio y fin). */
  readonly rangoInicial = input<RangoFechas | null>(null);
  /** «Hoy» del calendario: último día que se puede elegir. */
  readonly hoy = input<Date>(new Date());
  readonly vista = input<VistaMonitor>('cliente');

  readonly rangoCambio = output<RangoFechas>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly esMovil = injectMediaQuery('(max-width: 767.98px)');

  protected readonly placeholder = TEXTOS.selectorFechas.placeholder;
  protected readonly abierto = signal(false);
  protected readonly sobre = signal<Date | null>(null);

  protected readonly desde = linkedSignal<RangoFechas | null, Date | null>({
    source: this.rangoInicial,
    computation: (r, previo) => (r?.inicio && r.fin ? desdeIso(r.inicio) : (previo?.value ?? null)),
  });
  protected readonly hasta = linkedSignal<RangoFechas | null, Date | null>({
    source: this.rangoInicial,
    computation: (r, previo) => (r?.inicio && r.fin ? desdeIso(r.fin) : (previo?.value ?? null)),
  });

  protected readonly formato = computed<FormatoRegional>(() => (this.vista() === 'cliente' ? 'es-CO' : 'en-US'));
  protected readonly nombres = computed(() => NOMBRES_CALENDARIO[this.formato()]);
  private readonly primerMes = signal<MesVisible>({ anio: 0, mes: 0 });

  protected readonly meses = computed<MesVisible[]>(() => {
    const { anio, mes } = this.primerMes();
    const cantidad = this.esMovil() ? 1 : 2;
    return Array.from({ length: cantidad }, (_, i) => ({
      anio: anio + Math.floor((mes + i) / 12),
      mes: (mes + i) % 12,
    }));
  });

  protected readonly anios = computed(() => {
    const ultimo = this.hoy().getFullYear();
    return Array.from({ length: ANIOS_ATRAS + 1 }, (_, i) => ultimo - ANIOS_ATRAS + i);
  });

  /** Meses del año visible que caben antes de `hoy`. */
  protected readonly mesesDelAnio = computed(() => {
    const hoy = this.hoy();
    const tope = this.primerMes().anio === hoy.getFullYear() ? hoy.getMonth() : 11;
    return Array.from({ length: tope + 1 }, (_, i) => i);
  });

  protected readonly anteriorDeshabilitado = computed(() => {
    const { anio, mes } = this.primerMes();
    return anio < this.anios()[0] || (anio === this.anios()[0] && mes === 0);
  });

  protected readonly siguienteDeshabilitado = computed(() => {
    const ultimo = this.meses()[this.meses().length - 1];
    const hoy = this.hoy();
    return ultimo.anio * 12 + ultimo.mes >= hoy.getFullYear() * 12 + hoy.getMonth();
  });

  protected readonly texto = computed(() => {
    const desde = this.desde();
    const hasta = this.hasta();
    if (desde && hasta) {
      return `${aIso(desde)} - ${aIso(hasta)}`;
    }
    return desde ? aIso(desde) : '';
  });

  protected alternar(): void {
    if (!this.abierto()) {
      // Como ng-bootstrap, cada vez que abre arranca en el mes de hoy.
      this.primerMes.set({ anio: this.hoy().getFullYear(), mes: this.hoy().getMonth() });
    }
    this.abierto.update((a) => !a);
  }

  protected navegar(paso: number): void {
    const { anio, mes } = this.primerMes();
    const total = anio * 12 + mes + paso;
    this.primerMes.set({ anio: Math.floor(total / 12), mes: total % 12 });
  }

  protected cambiarMes(valor: string): void {
    this.primerMes.update((m) => ({ ...m, mes: Number(valor) }));
  }

  protected cambiarAnio(valor: string): void {
    const anio = Number(valor);
    const hoy = this.hoy();
    const mes = anio === hoy.getFullYear() ? Math.min(this.primerMes().mes, hoy.getMonth()) : this.primerMes().mes;
    this.primerMes.set({ anio, mes });
  }

  protected elegir(fecha: Date): void {
    const desde = this.desde();
    const hasta = this.hasta();
    if (!desde && !hasta) {
      this.desde.set(fecha);
    } else if (desde && !hasta && compararDias(fecha, desde) > 0) {
      this.hasta.set(fecha);
      this.rangoCambio.emit({ inicio: aIso(desde), fin: aIso(fecha) });
      this.abierto.set(false);
    } else {
      this.hasta.set(null);
      this.desde.set(fecha);
    }
  }

  /** Limpia el rango elegido (`reset()` de producción). */
  reiniciar(): void {
    this.desde.set(null);
    this.hasta.set(null);
    this.sobre.set(null);
  }

  protected alClicDocumento(e: MouseEvent): void {
    if (this.abierto() && !this.host.nativeElement.contains(e.target as Node | null)) {
      this.abierto.set(false);
    }
  }
}
