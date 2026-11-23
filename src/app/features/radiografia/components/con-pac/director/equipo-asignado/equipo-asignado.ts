import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';
import { LECTURAS_AUTOMATICAS_VISIBLES, RUTA_ACCION_VISIBLE } from '@features/radiografia/constants/ajustes';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { TEXTOS } from '@features/radiografia/constants/textos';
import { ANIOS_GESTION, ASESORES, BARRAS_GESTION, GESTION } from '@features/radiografia/data/clientes.mock';
import { FP_ASIGNADO } from '@features/radiografia/data/ruta-accion.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { vmGestion } from '@features/radiografia/utils/plan';

/**
 * Pestaña "Equipo asignado" (director, empresa con PAC): quién implementó el plan, su gestión por año,
 * clientes nuevos por quién los vinculó y asesores con clientes en la empresa.
 */
@Component({
  selector: 'nc-rx-equipo-asignado',
  imports: [ChartTip, Icono],
  templateUrl: './equipo-asignado.html',
  styleUrl: './equipo-asignado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipoAsignado {
  protected readonly store = inject(RadiografiaStore);

  /** Q-09: CTA "Crear Ruta de Acción" y tag del estado del plan; C-04: lectura automática. */
  protected readonly rutaAccionVisible = RUTA_ACCION_VISIBLE;
  protected readonly lecturasVisibles = LECTURAS_AUTOMATICAS_VISIBLES;
  protected readonly fpAsignado = FP_ASIGNADO;
  protected readonly textosRuta = TEXTOS.ruta;
  protected readonly enviada = TEXTOS.ruta.enviada;
  protected readonly netoAlerta = TEXTOS_CLIENTES.netoAlerta;
  protected readonly anios = ANIOS_GESTION;
  protected readonly barras = BARRAS_GESTION;
  protected readonly asesores = ASESORES;

  protected readonly anio = signal(2026);
  protected readonly gestion = computed(() => vmGestion(this.anio(), GESTION[this.anio()], GESTION[this.anio() - 1]));
}
