import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { LeyendaGrafica } from '@features/monitor/components/comunes/leyenda-grafica/leyenda-grafica';
import { TEXTOS } from '@features/monitor/constants/textos';
import { SerieLeyenda } from '@features/monitor/interfaces/comunes';
import { PuntoRiesgoRetorno } from '@features/monitor/interfaces/detalle';
import { opcionesRiesgoRetorno } from '@features/monitor/utils/detalle-riesgo-retorno';

/**
 * Gráfica «Riesgo/Retorno» de la comparación del Monitor exterior (`risk-return-chart`): un punto por activo
 * (volatilidad contra retorno) con leyenda propia. Las series ocultas vuelven a verse todas cuando cambia el
 * conjunto de activos.
 */
@Component({
  selector: 'nc-mon-grafica-riesgo-retorno',
  imports: [Grafica, LeyendaGrafica],
  template: `
    <nc-mon-leyenda-grafica
      vista="exterior"
      [series]="leyenda()"
      [activas]="activas()"
      [visible]="visible()"
      (alternar)="alternarSerie($event)"
      (quitar)="quitar.emit($event)"
    />
    <nc-mon-grafica class="grafica" [opciones]="opciones()" />
  `,
  // `#chart-container-risk`
  styles: ':host { display: block; } .grafica { width: 100%; height: 65vh; position: relative; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaRiesgoRetorno {
  readonly datos = input<readonly PuntoRiesgoRetorno[]>([]);
  /** La pestaña «Riesgo/Retorno» está activa. */
  readonly visible = input(false);

  /** Se ocultó o mostró una serie (la comparación también la saca de la tabla). */
  readonly alternar = output<string>();
  readonly quitar = output<string>();

  private readonly avisos = inject(AvisoStore);

  private readonly claves = computed(() => [...this.datos().map((d) => d.clave)].sort().join(','));

  private readonly ocultas = linkedSignal<string, string[]>({
    source: this.claves,
    computation: (_claves, previo) => (previo && previo.source === _claves ? previo.value : []),
  });

  protected readonly leyenda = computed<SerieLeyenda[]>(() =>
    this.datos().map((d) => ({ nombre: d.clave, color: d.color, nombreVisible: d.nombre, removible: true })),
  );

  protected readonly activas = computed<Record<string, boolean>>(() =>
    Object.fromEntries(this.datos().map((d) => [d.clave, !this.ocultas().includes(d.clave)])),
  );

  protected readonly opciones = computed(() =>
    opcionesRiesgoRetorno(this.datos(), this.ocultas(), () => this.avisos.mostrar(TEXTOS.sinDescargas)),
  );

  protected alternarSerie(clave: string): void {
    this.ocultas.update((o) => (o.includes(clave) ? o.filter((c) => c !== clave) : [...o, clave]));
    this.alternar.emit(clave);
  }
}
