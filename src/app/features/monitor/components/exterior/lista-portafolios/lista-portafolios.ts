import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { Buscador } from '@features/monitor/components/comunes/buscador/buscador';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { TEXTOS_EXTERIOR } from '@features/monitor/constants/textos-exterior';
import { PortafolioLista } from '@features/monitor/interfaces/exterior';
import {
  filtrarPortafolios,
  opcionesClasificacion,
  opcionesPerfil,
  portafolioDesactualizado,
  tooltipPortafolioDesactualizado,
} from '@features/monitor/utils/exterior-listas';
import { alternarId } from '@features/monitor/utils/detalle-listas';

/**
 * «Portafolios SK» (`portfolio-list`): filtros de clasificación y perfil de riesgo, interruptor de desactualizados
 * e inactivos, buscador y una tarjeta por portafolio que se marca con un clic (`[(seleccionados)]`, por clave).
 */
@Component({
  selector: 'nc-mon-lista-portafolios',
  imports: [Buscador, ErrorServicio, Icono, Seleccion, Tooltip],
  templateUrl: './lista-portafolios.html',
  styleUrl: './lista-portafolios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPortafolios {
  readonly portafolios = input<readonly PortafolioLista[]>([]);
  /** Claves marcadas, en el orden en que se marcaron. */
  readonly seleccionados = model<readonly string[]>([]);
  readonly conError = input(false);
  /** «Hoy»: con más de 30 días sin valor de unidad un portafolio está desactualizado. */
  readonly hoy = input<Date>(new Date());

  protected readonly textoClasificacion = TEXTOS_EXTERIOR.portafolios.clasificacion;
  protected readonly textoPerfil = TEXTOS_EXTERIOR.portafolios.perfilRiesgo;
  protected readonly clasificacion = signal<string | number>('');
  protected readonly perfil = signal<string | number>('');
  protected readonly termino = signal('');
  protected readonly mostrarInactivos = signal(false);

  protected readonly clasificaciones = computed(() => opcionesClasificacion(this.portafolios()));
  protected readonly perfiles = computed(() => opcionesPerfil(this.portafolios()));
  protected readonly filtrados = computed(() =>
    filtrarPortafolios(
      this.portafolios(),
      {
        clasificacion: this.clasificacion(),
        perfil: this.perfil(),
        termino: this.termino(),
        mostrarInactivos: this.mostrarInactivos(),
      },
      this.hoy(),
    ),
  );

  protected alternar(clave: string): void {
    this.seleccionados.set(alternarId(this.seleccionados(), clave));
  }

  protected desactualizado(p: PortafolioLista): boolean {
    return portafolioDesactualizado(p.ultimaFecha, this.hoy());
  }

  protected tooltipDesactualizado(p: PortafolioLista): string {
    return tooltipPortafolioDesactualizado(p.ultimaFecha);
  }
}
