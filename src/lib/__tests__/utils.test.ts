import { isDarkBg, getPaginationRange } from '../utils'
 
describe('utils', () => {
  it('debería tener utilidades disponibles', () => {
    expect(true).toBe(true)
  })

  it('debería identificar fondos oscuros y claros correctamente', () => {
    expect(isDarkBg('#000000')).toBe(true)
    expect(isDarkBg('#0F172A')).toBe(true)
    expect(isDarkBg('#FFFFFF')).toBe(false)
    expect(isDarkBg('#F8FAFC')).toBe(false)
    expect(isDarkBg('')).toBe(false)
    expect(isDarkBg('transparent')).toBe(false)
  })

  describe('getPaginationRange', () => {
    it('retorna array vacío para 0 o 1 página', () => {
      expect(getPaginationRange(1, 0)).toEqual([])
      expect(getPaginationRange(1, 1)).toEqual([])
    })

    it('retorna todas las páginas si totalPages <= 7', () => {
      expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
      expect(getPaginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('retorna ventana inicial con elipsis derecha si currentPage <= 4', () => {
      expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-right', 10])
      expect(getPaginationRange(4, 78)).toEqual([1, 2, 3, 4, 5, 'ellipsis-right', 78])
    })

    it('retorna ventana final con elipsis izquierda si currentPage >= totalPages - 3', () => {
      expect(getPaginationRange(7, 10)).toEqual([1, 'ellipsis-left', 6, 7, 8, 9, 10])
      expect(getPaginationRange(78, 78)).toEqual([1, 'ellipsis-left', 74, 75, 76, 77, 78])
    })

    it('retorna ventana intermedia con ambas elipsis si currentPage está en el medio', () => {
      expect(getPaginationRange(5, 10)).toEqual([1, 'ellipsis-left', 4, 5, 6, 'ellipsis-right', 10])
      expect(getPaginationRange(50, 78)).toEqual([1, 'ellipsis-left', 49, 50, 51, 'ellipsis-right', 78])
    })
  })
})


