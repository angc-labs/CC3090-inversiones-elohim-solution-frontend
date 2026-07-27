import { renderHook, waitFor } from "@testing-library/react";
import { useSessionExpiration } from "../useSessionExpiration";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

jest.mock("@/stores/useAuthStore");
jest.mock("next/navigation");

describe("useSessionExpiration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("no debería redirigir si la sesión sigue activa", () => {
    const mockRouter = {
      push: jest.fn(),
    };

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useAuthStore as jest.Mock).mockReturnValue({
      usuario: null,
      token: "token",
      expiraEn: Date.now() + 3600000,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      isSessionExpired: () => false,
    });

    renderHook(() => useSessionExpiration());

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("debería cerrar sesión cuando expiró", async () => {
    const mockRouter = {
      push: jest.fn(),
    };

    const mockLogout = jest.fn();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useAuthStore as jest.Mock).mockReturnValue({
      usuario: null,
      token: "token",
      expiraEn: Date.now() - 1000,
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockLogout,
      isSessionExpired: () => true,
    });

    renderHook(() => useSessionExpiration());

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });
});