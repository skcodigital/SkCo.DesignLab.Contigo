import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { Buscador } from '@features/monitor/components/comunes/buscador/buscador';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';
import { CompaniaReferencia, ItemReferencia, ReferenciaSeleccionada } from '@features/monitor/interfaces/detalle';
import {
  alternarReferencia,
  aplanarReferencias,
  desactualizado,
  filtrarReferencias,
  opcionesEntidad,
  opcionesTipoAhorro,
  tooltipDesactualizado,
  tooltipReferencia,
} from '@features/monitor/utils/detalle-listas';
import { capitalizar } from '@features/monitor/utils/formatos';

const L = TEXTOS_DETALLE.listas;

/**
 * Lista de portafolios de la competencia para comparar (`benchmark-list`): filtros de entidad y tipo de ahorro,
 * interruptor de desactualizados, buscador y una tarjeta por portafolio que se marca con un clic.
 *
 * Lo marcado vive en `seleccionados` (`[(seleccionados)]`). El cliente aplica la selección con «Aplicar» del
 * panel «Comparar»; el exterior la aplica en cada clic: eso lo decide quien escucha el cambio.
 * Diferencias entre vistas: el cliente solo pinta el logo si hay imagen y pone el tooltip de desactualizado a la
 * izquierda; el exterior siempre pinta el logo y pone el tooltip a la derecha.
 */
@Component({
  selector: 'nc-mon-lista-referencias',
  imports: [Buscador, ErrorServicio, Icono, Seleccion, Tooltip],
  templateUrl: './lista-referencias.html',
  styleUrl: './lista-referencias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-exterior]': "vista() === 'exterior'" },
})
export class ListaReferencias {
  readonly companias = input<readonly CompaniaReferencia[]>([]);
  readonly seleccionados = model<readonly ReferenciaSeleccionada[]>([]);
  readonly vista = input<VistaMonitor>('cliente');
  readonly conError = input(false);
  /** «Hoy»: los portafolios sin datos desde el 1 de enero de este año están desactualizados. */
  readonly hoy = input<Date>(new Date());

  protected readonly todos = L.todos;
  protected readonly tipoAhorro = L.tipoAhorro;
  protected readonly entidad = signal<string | number>('');
  protected readonly tipo = signal<string | number>('');
  protected readonly termino = signal('');
  protected readonly mostrarInactivos = signal(false);

  protected readonly entidades = computed(() => opcionesEntidad(this.companias()));
  protected readonly tipos = computed(() => opcionesTipoAhorro(this.companias()));
  private readonly items = computed(() => aplanarReferencias(this.companias()));

  protected readonly filtrados = computed(() =>
    filtrarReferencias(
      this.items(),
      { entidad: this.entidad(), tipo: this.tipo(), termino: this.termino(), mostrarInactivos: this.mostrarInactivos() },
      this.hoy(),
    ),
  );

  protected esSeleccionado(item: ItemReferencia): boolean {
    return this.seleccionados().some((s) => s.idCompania === item.idCompania && s.idPortafolio === item.id);
  }

  protected alternar(item: ItemReferencia): void {
    this.seleccionados.set(alternarReferencia(this.seleccionados(), item));
  }

  protected tooltip(item: ItemReferencia): string | null {
    return tooltipReferencia(item, { entidad: this.entidad(), tipo: this.tipo() });
  }

  protected desactualizado(item: ItemReferencia): boolean {
    return desactualizado(item.fechaMaxima, this.hoy());
  }

  protected tooltipDesactualizado(fecha: string): string {
    return tooltipDesactualizado(fecha);
  }

  protected capitalizar(texto: string): string {
    return capitalizar(texto);
  }
}
