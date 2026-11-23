import { RECIENTES } from '../data/busqueda';
import { coincide, normalizar, resaltar } from './busqueda';

describe('busqueda', () => {
  const oscar = RECIENTES[0];
  const empresa = RECIENTES[1];

  it('normaliza tildes, mayúsculas y bordes', () => {
    expect(normalizar('  Óscar HERNÁNDEZ ')).toBe('oscar hernandez');
  });

  it('encuentra por nombre sin tildes', () => {
    expect(coincide(oscar, 'hernandez')).toBe(true);
    expect(coincide(empresa, 'hernandez')).toBe(false);
  });

  it('encuentra el NIT escrito con puntos', () => {
    expect(coincide(empresa, '900.456.789')).toBe(true);
  });

  it('sin consulta muestra todo', () => {
    expect(coincide(oscar, '   ')).toBe(true);
  });

  it('resalta la coincidencia conservando las tildes del original', () => {
    expect(resaltar('Óscar Camilo', 'osc')).toEqual({ antes: '', marca: 'Ósc', despues: 'ar Camilo' });
  });

  it('sin coincidencia en el título no resalta', () => {
    expect(resaltar('Empresa ABC S.A.', '9004')).toEqual({ antes: 'Empresa ABC S.A.', marca: '', despues: '' });
  });
});
