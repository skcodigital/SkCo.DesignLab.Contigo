import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { IndicadoresMercado } from '../../components/indicadores-mercado/indicadores-mercado';
import { Logros } from '../../components/logros/logros';
import { PlaneacionSemana } from '../../components/planeacion-semana/planeacion-semana';
import { TEXTOS } from '../../constants/textos';
import { DashboardStore } from '../../state/dashboard.store';

/**
 * Inicio del asesor (Figma Portal Contigo · AMPLIADOS): indicadores de mercado, aviso, módulos
 * (Planeación Pro · Tu semana + «Agregar módulo») y Logros del mes.
 */
@Component({
  selector: 'nc-dashboard-page',
  imports: [IndicadoresMercado, PlaneacionSemana, Logros],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardStore],
})
export class DashboardPage {
  private readonly avisos = inject(AvisoStore);

  protected agregarModulo(): void {
    this.avisos.mostrar(TEXTOS.avisos.agregarModulo);
  }
}
