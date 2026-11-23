import { esMensajeTelefono, sinEmbed } from './vista-previa';

describe('vista previa', () => {
  it('quita embed y conserva los demás parámetros', () => {
    expect(sinEmbed('/radiografia?plan=sin&embed=1&tab=clientes')).toBe('/radiografia?plan=sin&tab=clientes');
    expect(sinEmbed('/ficha?embed=1')).toBe('/ficha');
    expect(sinEmbed('/inicio')).toBe('/inicio');
  });

  it('reconoce solo los mensajes del teléfono', () => {
    expect(esMensajeTelefono({ nc: 'url', url: '/ficha' })).toBe(true);
    expect(esMensajeTelefono({ nc: 'radio' })).toBe(false);
    expect(esMensajeTelefono('url')).toBe(false);
    expect(esMensajeTelefono(null)).toBe(false);
  });
});
