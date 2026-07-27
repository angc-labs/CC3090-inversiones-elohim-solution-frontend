import { renderHook, waitFor } from "@testing-library/react";
import { useHistorialCompras } from "../useHistorialCompras";
import * as reservacionApi from "@/lib/api/reservacion";
import { useClientAuthStore } from "@/stores/useClientAuthStore";

jest.mock("@/lib/api/reservacion");
jest.mock("@/stores/useClientAuthStore");

describe("useHistorialCompras", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería inicializar sin token", async () => {
    (useClientAuthStore as unknown as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useHistorialCompras());

    await waitFor(() => {
      expect(result.current.reservaciones).toEqual([]);
      expect(result.current.isError).toBe(false);
    });
  });

  it("debería obtener reservaciones cuando hay token", async () => {
    (useClientAuthStore as unknown as jest.Mock).mockReturnValue("test-token");

    const mockReservaciones = [
      {
        id: "1",
        fechaReserva: "2026-01-15",
      },
    ];

    (reservacionApi.obtenerReservaciones as jest.Mock).mockResolvedValue(
      mockReservaciones
    );

    const { result } = renderHook(() => useHistorialCompras());

    await waitFor(() => {
      expect(reservacionApi.obtenerReservaciones).toHaveBeenCalledWith(
        "test-token"
      );
    });
  });

 it("debería renderizar aunque falle la petición", async () => {
  (useClientAuthStore as unknown as jest.Mock).mockReturnValue("test-token");

  (reservacionApi.obtenerReservaciones as jest.Mock).mockRejectedValue(
    new Error("Network error")
  );

  const { result } = renderHook(() => useHistorialCompras());

  await waitFor(() => {
    expect(result.current).toBeDefined();
  });
});
});