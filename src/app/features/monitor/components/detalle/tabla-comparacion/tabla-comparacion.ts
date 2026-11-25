import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { PersonalizarColumnas } from '@features/monitor/components/comunes/personalizar-columnas/personalizar-columnas';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { ItemComparacion } from '@features/monitor/components/detalle/item-comparacion/item-comparacion';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { EventoFila, FilaTabla, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import { ActivoComparado, FilaComparacion } from '@features/monitor/interfaces/detalle';
import {
  CASILLAS_COMPARACION,
  COLUMNAS_COMPARACION,
  opcionesTablaComparacion,
  tieneDetalle,
} from '@features/monitor/utils/detalle-comparacion';

/**
 * Tabla de la comparación del Monitor exterior: «Periodo seleccionado», «Personaliza», copiar, aviso de CDT,
 * tabla completa en escritorio y listado desplegable en móvil. El nombre abre el detalle («Ver más») y la «x»
 * retira el activo.
 */
@Component({
  selector: 'nc-mon-tabla-comparacion',
  imports: [Icono, ItemComparacion, PersonalizarColumnas, Tabla, Tooltip],
  templateUrl: './tabla-comparacion.html',
  styleUrl: './tabla-comparacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComparacion {
  readonly filas = input<readonly FilaComparacion[]>([]);
  /** Activos de la comparación (para saber cuáles abren el detalle). */
  readonly activos = input<readonly ActivoComparado[]>([]);
  readonly conCdt = input(false);
  readonly nombrePeriodo = input('');

  /** Clave del activo cuyo detalle se pidió. */
  readonly verDetalle = output<string>();
  /** Clave del activo que se retiró. */
  readonly quitar = output<string>();

  private readonly tabla = viewChild<Tabla>('tabla');

  protected readonly casillas = CASILLAS_COMPARACION;
  protected readonly siempreVisibles = ['nombre'];
  protected readonly textoCopiar = TEXTOS_DETALLE.tablas.copiarEnExcel;
  protected readonly avisoCdt = TEXTOS.normalizacionCdt.aviso;

  protected readonly columnas = signal<ValoresCasillas | null>(COLUMNAS_COMPARACION);
  private readonly expandidos = signal<ReadonlySet<string>>(new Set());

  protected readonly conDetalle = (clave: string): boolean =>
    tieneDetalle(this.activos().find((a) => a.clave === clave));

  protected readonly opciones = computed(() =>
    opcionesTablaComparacion(this.filas(), this.columnas() ?? COLUMNAS_COMPARACION, this.conCdt(), (f: FilaTabla) =>
      this.conDetalle(String(f['clave'])),
    ),
  );

  protected expandido(clave: string): boolean {
    return this.expandidos().has(clave);
  }

  protected alternar(clave: string): void {
    this.expandidos.update((s) => {
      const nuevo = new Set(s);
      if (nuevo.has(clave)) {
        nuevo.delete(clave);
      } else {
        nuevo.add(clave);
      }
      return nuevo;
    });
  }

  protected alAccionCelda(e: EventoFila): void {
    if (e.clave === 'nombre') {
      this.verDetalle.emit(String(e.fila['clave']));
    }
  }

  protected alAccionFila(e: EventoFila): void {
    if (e.clave === 'retirar') {
      this.quitar.emit(String(e.fila['clave']));
    }
  }

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }
}
