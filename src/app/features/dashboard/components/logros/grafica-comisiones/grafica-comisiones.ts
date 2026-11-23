import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TEXTOS } from '../../../constants/textos';
import { ComisionMes } from '../../../interfaces/logros';
import { formatearPesos } from '../../../utils/formato';
import { polilinea, puntosComisiones } from '../../../utils/logros';

/** «Tus comisiones»: total del año y línea de enero a diciembre con un punto por mes y tooltip con el dato (Figma · 35987:7144). */
@Component({
  selector: 'article[nc-grafica-comisiones]',
  templateUrl: './grafica-comisiones.html',
  styleUrl: './grafica-comisiones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.oculto]': 'oculto()' },
})
export class GraficaComisiones {
  readonly meses = input.required<readonly ComisionMes[]>();
  readonly total = input.required<number>();
  readonly oculto = input(true);

  protected readonly totalTexto = computed(() => formatearPesos(this.total()));
  protected readonly puntos = computed(() => {
    const oculto = this.oculto();
    return puntosComisiones(this.meses()).map((p) => {
      const valor = formatearPesos(p.valor);
      return { ...p, valorTexto: valor, aria: TEXTOS.logros.puntoAria(p.mes, oculto ? TEXTOS.logros.saldoOculto : valor) };
    });
  });
  protected readonly linea = computed(() => polilinea(this.puntos()));
}
