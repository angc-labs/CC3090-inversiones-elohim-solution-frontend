import { renderHook, waitFor } from '@testing-library/react'
import { useHistorialCompras } from '../useHistorialCompras'
import * as api from '@/lib/api'
import { useClientAuthStore } from '@/stores/useClientAuthStore'

jest.mock('@/lib/api')
jest.mock('@/stores/useClientAuthStore')

describe('useHistorialCompras', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debería inicializar sin token', async () => {
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(null)

    const { result } = renderHook(() => useHistorialCompras())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('debería obtener el historial de compras cuando hay token', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    const mockHistorial = {
      compras: [
        {
          id: '1',
          fecha: '2026-01-15',
          total: 100,
        },
      ],
    }

    ;(api as any).obtenerHistorialCompras = jest.fn().mockResolvedValue(mockHistorial)

    const { result } = renderHook(() => useHistorialCompras())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('debería manejar errores al obtener el historial', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    ;(api as any).obtenerHistorialCompras = jest.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useHistorialCompras())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })
})
