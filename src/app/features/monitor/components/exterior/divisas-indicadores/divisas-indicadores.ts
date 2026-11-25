import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { ListaCdt } from '@features/monitor/components/detalle/lista-cdt/lista-cdt';
import { DefinicionActivo, PlazoCdt } from '@features/monitor/interfaces/detalle';
import { IndicadorSeleccionado, PestanaIndicadores, TipoIndicador } from '@features/monitor/interfaces/exterior';
import { alternarIndicador, itemsIndicador } from '@features/monitor/utils/exterior-listas';

/**
 * Divisas e indicadores para comparar (`divisa-indicador`). Con `modo="divisas"` es una grilla de divisas; con
 * `modo="indicadores"` lleva las pestañas «Económicos» (grilla de indicadores) y «CDTs» (`nc-mon-lista-cdt`).
 * Cada clic marca o desmarca: `[(seleccionados)]` (divisas e indicadores juntos) y `[(cdts)]` (subcuentas).
 */
@Component({
  selector: 'nc-mon-divisas-indicadores',
  imports: [ErrorServicio, ListaCdt, NgTemplateOutlet],
  templateUrl: './divisas-indicadores.html',
  styleUrl: './divisas-indicadores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DivisasIndicadores {
  readonly modo = input<'divisas' | 'indicadores'>('divisas');
  /** Divisas e indicadores del catálogo. */
  readonly catalogo = input<readonly DefinicionActivo[]>([]);
  readonly seleccionados = model<readonly IndicadorSeleccionado[]>([]);
  readonly plazos = input<readonly PlazoCdt[]>([]);
  readonly cdts = model<readonly string[]>([]);
  readonly conError = input(false);

  protected readonly pestana = signal<PestanaIndicadores>('economicos');
  protected readonly items = computed(() =>
    itemsIndicador(this.catalogo(), this.modo() === 'divisas' ? 'divisa' : 'indicador'),
  );

  protected esSeleccionado(tipo: TipoIndicador, clave: string): boolean {
    return this.seleccionados().some((i) => i.tipo === tipo && i.clave === clave);
  }

  protected alternar(tipo: TipoIndicador, clave: string): void {
    this.seleccionados.set(alternarIndicador(this.seleccionados(), tipo, clave));
  }
}
