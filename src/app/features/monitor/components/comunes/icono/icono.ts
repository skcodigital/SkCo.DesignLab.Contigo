import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NombreIcono } from '@features/monitor/interfaces/comunes';

/**
 * Ícono SVG (trazo 2, `currentColor`, 1em) que reemplaza la fuente de íconos del portal: hereda el color y el
 * tamaño (`font-size`) igual que el glifo. Equivalencias con las clases de producción:
 *
 * | Producción                                              | Aquí                        |
 * | ------------------------------------------------------- | --------------------------- |
 * | icon-Calendar-line                                      | calendario                  |
 * | icon-Chevron-down/up/left/right-line (y -solid)         | chevron-abajo/arriba/izquierda/derecha |
 * | icon-Circle-chevron-left/right-solid                    | circulo-chevron-izquierda/derecha |
 * | icon-Circle-xmark-line                                  | circulo-x                   |
 * | icon-circle-exclamation-line                            | circulo-exclamacion         |
 * | icon-Circle-question-line                               | circulo-pregunta            |
 * | icon-Circle-check-line / icon-Circle-dollar             | circulo-check / circulo-dolar |
 * | icon-clock-line, icon-clock-line1                       | reloj                       |
 * | icon-increase-arrow / icon-decrease-arrow               | flecha-sube / flecha-baja   |
 * | icon-emojione-monotone_up-arrow_green / _red            | flecha-verde / flecha-roja  |
 * | icon-Edit-line / icon-solar_pen-bold                    | editar / lapiz              |
 * | icon-Copy, icon-mingcute_copy-fill                      | copiar                      |
 * | icon-buscador, icon-buscar, icon-magnifying-glass-line  | buscar                      |
 * | icon-magnifying-glass-plus-line                         | buscar-mas                  |
 * | icon-Group-5 (ordenar) / icon-filter_white, icon-filter | ordenar / filtro            |
 * | icon-Xmark-line/-solid, icon-material-symbols_close     | cerrar                      |
 * | icon-Download-line/-solid / icon-camera-line            | descargar / camara          |
 * | icon-Chart-line, sk-fa-solid_chart-line                 | grafica-linea               |
 * | icon-Chart-line-up-line / icon-chart-bar-line           | grafica-linea-sube / grafica-barras |
 * | icon-Refresh-line/-solid / icon-Receipt / icon-File-line | refrescar / recibo / archivo |
 * | icon-rocket-line / icon-globe-line / icon-Circle-dollar | cohete / globo / circulo-dolar |
 * | icon-Code-compare / icon-arrows-retweet-line, icon-arrow-down-arrow-up | comparar / intercambiar |
 * | icon-Arrow-up-line/-solid / icon-Arrow-left-solid, icon-ic_outline-arrow-back | flecha-arriba / flecha-izquierda |
 * | icon-Laptop-line/-solid / icon-pc / icon-Sidebar        | portatil / pantalla / barra-lateral |
 * | icon-Star-solid / icon-ph_heart-bold / icon-ion_newspaper | estrella / corazon / noticias |
 * | icon-Triangle-exclamation-line / icon-mingcute_alert-fill-1 | triangulo-alerta / alerta |
 * | sk_info_p.svg (imagen)                                  | info                        |
 */
@Component({
  selector: 'nc-mon-icono',
  templateUrl: './icono.html',
  styleUrl: './icono.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
}
