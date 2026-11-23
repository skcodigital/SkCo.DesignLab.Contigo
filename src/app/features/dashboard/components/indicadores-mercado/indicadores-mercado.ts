import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { INDICADORES_MERCADO } from '../../data/mercado.mock';

/** Cabecera del dashboard: «Personalizar» y banner de indicadores de mercado (cinta continua que se pausa con hover/foco). */
@Component({
  selector: 'nc-indicadores-mercado',
  imports: [NgTemplateOutlet],
  templateUrl: './indicadores-mercado.html',
  styleUrl: './indicadores-mercado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresMercado {
  protected readonly indicadores = INDICADORES_MERCADO;
}
