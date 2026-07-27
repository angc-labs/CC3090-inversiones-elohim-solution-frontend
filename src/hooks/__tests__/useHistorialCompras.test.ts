import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { SWRConfig } from 'swr'
import { useHistorialCompras } from '../useHistorialCompras'
import { obtenerReservaciones } from '@/lib/api/reservacion'
import { useClientAuthStore } from '@/stores/useClientAuthStore'

jest.mock('@/lib/api/reservacion')
jest.mock('@/stores/useClientAuthStore')

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  )
}

describe('useHistorialCompras', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debería inicializar sin token', async () => {
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(null)

    const { result } = renderHook(() => useHistorialCompras(), { wrapper })

    await waitFor(() => {
      expect(result.current.reservaciones).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })
  })

  it('debería obtener el historial de compras cuando hay token', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)

    const mockReservaciones = [
      {
        idReservacion: '1',
        codigoReservacion: 'RES-001',
        clienteId: 'cliente-123',
        estado: 'pendiente',
        totalReservacion: 100,
        pagado: false,
        fechaLimiteRetiro: '2026-07-30T00:00:00Z',
      },
    ]

    ;(obtenerReservaciones as jest.Mock).mockResolvedValue(mockReservaciones)

    const { result } = renderHook(() => useHistorialCompras(), { wrapper })

    await waitFor(() => {
      expect(obtenerReservaciones).toHaveBeenCalledWith(mockToken)
      expect(result.current.reservaciones).toEqual(mockReservaciones)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })
  })

  it('debería manejar errores al obtener el historial', async () => {
    const mockToken = 'test-token'
    ;(useClientAuthStore as unknown as jest.Mock).mockReturnValue(mockToken)
    const mockError = new Error('Network error')

    ;(obtenerReservaciones as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useHistorialCompras(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBe(mockError)
      expect(result.current.reservaciones).toEqual([])
    })
  })
})
