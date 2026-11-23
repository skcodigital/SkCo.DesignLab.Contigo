import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { Variacion } from '@features/radiografia/components/comunes/variacion/variacion';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { HALLAZGOS, PLANES, TIPOS_PLAN } from '@features/radiografia/data/plan.mock';
import { TipoPlan } from '@features/radiografia/interfaces/clientes';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { fmtPesos } from '@features/radiografia/utils/formato';
import { graficaAum, paresDinero, textoContratos, variacionAum } from '@features/radiografia/utils/plan';

/**
 * Pestaña Plan corporativo (empresa con PAC). La ven el director y el FP Asignado (mismo panel).
 * Selector por tipo de plan: indicadores, aportes y retiros anuales, evolución del AUM y hallazgo.
 */
@Component({
  selector: 'nc-rx-plan-corporativo',
  imports: [ChartTip, Variacion, Icono],
  templateUrl: './plan-corporativo.html',
  styleUrl: './plan-corporativo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCorporativo {
  protected readonly store = inject(RadiografiaStore);

  protected readonly tipos = TIPOS_PLAN;
  protected readonly tip = TEXTOS_CLIENTES.tip;
  protected readonly tipo = signal<TipoPlan>('bonificaciones');

  protected readonly plan = computed(() => PLANES[this.tipo()]);
  protected readonly hallazgo = computed(() => HALLAZGOS[this.tipo()]);
  protected readonly aportes = computed(() => fmtPesos(this.plan().aportes2026) + ' M');
  protected readonly venta = computed(() => '+' + fmtPesos(this.plan().ventaNeta) + ' M');
  protected readonly aum = computed(() => fmtPesos(this.plan().aum) + ' M');
  protected readonly contratos = computed(() => this.plan().contratos.toLocaleString('es-CO'));
  protected readonly contratosSub = computed(() => textoContratos(this.plan().contratos));
  /** Variación del AUM frente a octubre de 2025, con la iconografía de Logros (datos de ejemplo). */
  protected readonly variacion = computed(() => variacionAum(this.plan().aum, this.plan().aumOct25));
  protected readonly pares = computed(() => paresDinero(this.plan().anios));
  protected readonly grafica = computed(() => graficaAum(this.plan().aumPts));
}
