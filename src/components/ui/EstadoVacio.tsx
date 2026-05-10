"use client";

interface EstadoVacioProps {
  mensaje: string;
  descripcion?: string;
}

export function EstadoVacio({ mensaje, descripcion }: EstadoVacioProps) {
  return (
    <div className="text-center! py-12!">
      <div className="mx-auto! h-24! w-24! text-gray-400! mb-4!">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0h-2"
          />
        </svg>
      </div>
      <h3 className="text-lg! font-medium! text-gray-900! mb-2!">{mensaje}</h3>
      {descripcion && (
        <p className="text-gray-500!">{descripcion}</p>
      )}
    </div>
  );
}