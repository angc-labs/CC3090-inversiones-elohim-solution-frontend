import { useAuthStore } from '../useAuthStore'
import { TUsuario } from '../useAuthStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: null,
      token: null,
      expiraEn: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  describe('login', () => {
    it('debe establecer el usuario y token correctamente', () => {
      const usuario: TUsuario = {
        usuarioId: '123',
        correo: 'test@test.com',
        nombre: 'Test User',
        rol: 'cliente',
      }
      const token = 'test-token-123'
      const expiraEn = Date.now() + 3600000

      useAuthStore.getState().login(usuario, token, expiraEn)

      const state = useAuthStore.getState()
      expect(state.usuario).toEqual(usuario)
      expect(state.token).toBe(token)
      expect(state.expiraEn).toBe(expiraEn)
      expect(state.isAuthenticated).toBe(true)
    })

    it('debe limpiar active_tenant_id del localStorage al hacer login', () => {
      localStorage.setItem('active_tenant_id', 'old-tenant-id')

      const usuario: TUsuario = {
        usuarioId: '123',
        correo: 'test@test.com',
        nombre: 'Test User',
        rol: 'admin',
      }

      useAuthStore.getState().login(usuario, 'token', Date.now() + 3600000)

      expect(localStorage.getItem('active_tenant_id')).toBeNull()
    })
  })

  describe('logout', () => {
    it('debe limpiar los datos del usuario', () => {
      const usuario: TUsuario = {
        usuarioId: '123',
        correo: 'test@test.com',
        nombre: 'Test User',
        rol: 'cliente',
      }

      useAuthStore.getState().login(usuario, 'token', Date.now() + 3600000)
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.usuario).toBeNull()
      expect(state.token).toBeNull()
      expect(state.expiraEn).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('debe limpiar active_tenant_id del localStorage al hacer logout', () => {
      localStorage.setItem('active_tenant_id', 'tenant-id')

      useAuthStore.getState().logout()

      expect(localStorage.getItem('active_tenant_id')).toBeNull()
    })
  })

  describe('isSessionExpired', () => {
    it('debe retornar false si no hay expiraEn', () => {
      const result = useAuthStore.getState().isSessionExpired()
      expect(result).toBe(false)
    })

    it('debe retornar false si la sesión aún no ha expirado', () => {
      const futureTime = Date.now() + 3600000 // 1 hora en el futuro
      useAuthStore.setState({ expiraEn: futureTime })

      const result = useAuthStore.getState().isSessionExpired()
      expect(result).toBe(false)
    })

    it('debe retornar true si la sesión ha expirado', () => {
      const pastTime = Date.now() - 3600000 // 1 hora en el pasado
      useAuthStore.setState({ expiraEn: pastTime })

      const result = useAuthStore.getState().isSessionExpired()
      expect(result).toBe(true)
    })
  })

  describe('diferentes roles', () => {
    const roles: TUsuario['rol'][] = ['cliente', 'cajero', 'admin', 'superadmin']

    roles.forEach((rol) => {
      it(`debe permitir login con rol ${rol}`, () => {
        const usuario: TUsuario = {
          usuarioId: '123',
          correo: 'user@test.com',
          nombre: 'User',
          rol,
        }

        useAuthStore.getState().login(usuario, 'token', Date.now() + 3600000)

        const state = useAuthStore.getState()
        expect(state.usuario?.rol).toBe(rol)
        expect(state.isAuthenticated).toBe(true)
      })
    })
  })

  describe('superadmin flag', () => {
    it('debe preservar el flag esSuperAdmin', () => {
      const usuario: TUsuario = {
        usuarioId: '123',
        correo: 'superadmin@test.com',
        nombre: 'Super Admin',
        rol: 'superadmin',
        esSuperAdmin: true,
      }

      useAuthStore.getState().login(usuario, 'token', Date.now() + 3600000)

      expect(useAuthStore.getState().usuario?.esSuperAdmin).toBe(true)
    })
  })
})
