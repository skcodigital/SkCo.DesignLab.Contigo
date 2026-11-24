import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { ADV_CORTA, ADV_RESTO, GLOSA_RENTA_EXENTA } from '../../../constants/textos';
import { Retiro } from '../../../interfaces/calculo';
import { RespuestaRx } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { aniosTxt, ctSel, prefEsRetiro } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';

const [ADV_ANTES, ADV_DESPUES] = ADV_CORTA.split('renta exenta');

/**
 * «¿Se usaron como renta exenta?» y la advertencia de la DIAN, dentro de la caja del retiro (v5 del journey).
 * Se pinta en la `.jw-o3-cuerpo` de la caja que corresponde.
 */
@Component({
  selector: 'nc-renta-exenta',
  imports: [Icono],
  templateUrl: './renta-exenta.html',
  styleUrl: './renta-exenta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentaExenta {
  private readonly store = inject(ConversacionesStore);

  /** Retiro sobre el que se pregunta (sus aportes por año van en el «i»). */
  readonly k = input.required<Retiro>();
  /** Qué se pinta: la pregunta (antes del posible impuesto), la advertencia (al final de la caja) o ambas. */
  readonly parte = input<'pregunta' | 'advertencia' | 'todo'>('todo');

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly pide = computed(() => prefEsRetiro(this.st()) && !this.st().rx && !this.ro());
  /** Valor total del retiro sobre el que se pregunta (el elegido o, si no hay, el del monto). */
  protected readonly valor = computed(() => pesos(this.k().D));
  protected readonly anios = computed(() => aniosTxt(ctSel(this.st()), this.k()));
  protected readonly opciones: readonly (readonly [RespuestaRx, string])[] = [['si', 'Sí'], ['no', 'No'], ['nosabe', 'No sabe']];
  protected readonly advCorta = ADV_CORTA;
  protected readonly advAntes = ADV_ANTES;
  protected readonly advDespues = ADV_DESPUES;
  protected readonly advResto = ADV_RESTO;
  protected readonly glosa = GLOSA_RENTA_EXENTA;

  protected responder(v: RespuestaRx): void {
    this.store.responderRentaExenta(v);
  }

  protected alternarInfo(): void {
    this.store.alternarInfoRentaExenta();
  }

  protected leerMas(): void {
    this.store.leerMas();
  }
}
