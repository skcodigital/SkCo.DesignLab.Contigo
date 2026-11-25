import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { LeyendaGrafica } from '@features/monitor/components/comunes/leyenda-grafica/leyenda-grafica';
import { TEXTOS } from '@features/monitor/constants/textos';
import { DatosTendencia, opcionesTendencia } from '@features/monitor/utils/detalle-graficas';
import { EChartsType } from '@features/monitor/utils/echarts';
import { ICONO_GUARDAR_COMO_IMAGEN } from '@features/monitor/utils/graficas-lineas';

const VACIA: DatosTendencia = { etiquetas: [], series: [], leyenda: [], yMin: 0, yMax: 0, nombres: {}, imagenes: {} };

/**
 * Gráfica «Tendencia» de la comparación del Monitor exterior (`#line-chart-container` de `monitor`): leyenda
 * propia con «x» para retirar y líneas con zoom. Las series ocultas (`ocultas`) se aplican con la leyenda de
 * ECharts para no perder el zoom.
 */
@Component({
  selector: 'nc-mon-grafica-tendencia',
  imports: [Grafica, LeyendaGrafica],
  template: `
    <nc-mon-leyenda-grafica
      vista="exterior"
      [series]="leyenda()"
      [activas]="activas()"
      [visible]="visible()"
      (alternar)="alternar.emit($event)"
      (quitar)="quitar.emit($event)"
    />
    <nc-mon-grafica class="grafica" [opciones]="opciones()" (lista)="alIniciar($event)" />
  `,
  // `.content-chart` y `#line-chart-container`
  styles: `
    :host { display: flex; flex-direction: column; width: 100%; min-width: 0; overflow: hidden; }
    .grafica { position: relative; height: 59vh; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaTendencia {
  readonly datos = input<DatosTendencia | null>(null);
  /** Hay un CDT elegido: el tooltip muestra todo en tasa. */
  readonly conCdt = input(false);
  /** Claves de las series ocultas desde la leyenda. */
  readonly ocultas = input<readonly string[]>([]);
  /** La pestaña «Tendencia» está activa (la leyenda vuelve a medir sus flechas). */
  readonly visible = input(true);

  readonly alternar = output<string>();
  readonly quitar = output<string>();

  private readonly avisos = inject(AvisoStore);
  private readonly grafica = signal<EChartsType | null>(null);

  protected readonly leyenda = computed(() => this.datos()?.leyenda ?? []);

  protected readonly activas = computed<Record<string, boolean>>(() =>
    Object.fromEntries(this.leyenda().map((s) => [s.nombre, !this.ocultas().includes(s.nombre)])),
  );

  protected readonly opciones = computed(() =>
    opcionesTendencia(this.datos() ?? VACIA, this.conCdt(), {
      clave: 'myGuardarImagen',
      titulo: TEXTOS.graficas.guardarComoImagen,
      icono: ICONO_GUARDAR_COMO_IMAGEN,
      alClic: () => this.avisos.mostrar(TEXTOS.sinDescargas),
    }),
  );

  constructor() {
    // Después de pintar (y de que la gráfica base aplique las opciones), la leyenda de ECharts sigue a `ocultas`.
    afterRenderEffect(() => {
      this.opciones();
      this.aplicarLeyenda(this.grafica(), this.activas());
    });
  }

  protected alIniciar(grafica: EChartsType): void {
    this.grafica.set(grafica);
    grafica.on('restore', () => this.aplicarLeyenda(grafica, this.activas()));
  }

  private aplicarLeyenda(grafica: EChartsType | null, activas: Readonly<Record<string, boolean>>): void {
    if (!grafica || grafica.isDisposed()) {
      return;
    }
    Object.entries(activas).forEach(([name, activa]) =>
      grafica.dispatchAction({ type: activa ? 'legendSelect' : 'legendUnSelect', name }),
    );
  }
}
