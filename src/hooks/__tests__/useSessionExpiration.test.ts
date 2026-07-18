import { renderHook, waitFor } from '@testing-library/react'
import { useSessionExpiration } from '../useSessionExpiration'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'

jest.mock('@/stores/useAuthStore')
jest.mock('next/navigation')

describe('useSessionExpiration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('no debería hacer nada si la sesión no ha expirado', () => {
    const mockRouter = {
      push: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    const futureTime = Date.now() + 3600000
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isSessionExpired: () => false,
          logout: jest.fn(),
        })
      }
    })

    renderHook(() => useSessionExpiration())

    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('debería redirigir a login si la sesión ha expirado', async () => {
    const mockRouter = {
      push: jest.fn(),
    }
    const mockLogout = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    ;(useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isSessionExpired: () => true,
          logout: mockLogout,
        })
      }
    })

    renderHook(() => useSessionExpiration())

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/login')
    })
  })
})
