import { renderHook, waitFor } from '@testing-library/react'
import { useCarrito } from '../useCarrito'
import * as carritoApi from '@/lib/api/carrito'
import * as productosApi from '@/lib/api/productos'
import { useClientAuthStore } from '@/stores/useClientAuthStore'

jest.mock('@/lib/api/carrito')
jest.mock('@/lib/api/productos')
jest.mock('@/stores/useClientAuthStore')

describe('useCarrito', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debería inicializar sin token', async () => {
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(null)
    ;(carritoApi.obtenerCarrito as jest.Mock).mockResolvedValue({
      items: [],
    })

    const { result } = renderHook(() => useCarrito())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('debería obtener el carrito cuando hay token', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    const mockCarrito = {
      items: [
        {
          articuloId: '1',
          productoId: '1',
          cantidad: 2,
        },
      ],
    }

    ;(carritoApi.obtenerCarrito as jest.Mock).mockResolvedValue(mockCarrito)

    const { result } = renderHook(() => useCarrito())

    await waitFor(() => {
      expect(carritoApi.obtenerCarrito).toHaveBeenCalledWith(mockToken)
    })
  })

  it('debería mostrar error de stock si la cantidad es mayor que el stock disponible', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    const mockCarrito = {
      items: [
        {
          articuloId: '1',
          productoId: '1',
          cantidad: 10,
        },
      ],
    }

    ;(carritoApi.obtenerCarrito as jest.Mock).mockResolvedValue(mockCarrito)
    ;(productosApi.obtenerProductoPorId as jest.Mock).mockResolvedValue({
      stockActual: 5,
    })

    ;(carritoApi.actualizarArticuloCarrito as jest.Mock).mockResolvedValue({})

    const { result } = renderHook(() => useCarrito())

    await waitFor(() => {
      expect(carritoApi.actualizarArticuloCarrito).toHaveBeenCalled()
    })
  })

  it('debería eliminar artículos inválidos si el producto no existe (404)', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    const mockCarrito = {
      items: [
        {
          articuloId: '1',
          productoId: '999',
          cantidad: 1,
        },
      ],
    }

    ;(carritoApi.obtenerCarrito as jest.Mock).mockResolvedValue(mockCarrito)
    ;(productosApi.obtenerProductoPorId as jest.Mock).mockRejectedValue({
      status: 404,
    })

    ;(carritoApi.eliminarArticuloCarrito as jest.Mock).mockResolvedValue({})

    const { result } = renderHook(() => useCarrito())

    await waitFor(() => {
      expect(carritoApi.eliminarArticuloCarrito).toHaveBeenCalledWith(mockToken, '1')
    })
  })
})
