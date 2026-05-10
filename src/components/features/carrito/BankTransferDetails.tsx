"use client";

import { useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface BankTransferDetailsProps {
  onConfirm: (reference?: string) => void;
  isLoading: boolean;
}

export function BankTransferDetails({ onConfirm, isLoading }: BankTransferDetailsProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos bancarios (hardcoded por ahora - en producción vendrían de API)
  const bankDetails = {
    bankName: "Banco de Guatemala",
    accountNumber: "1234567890",
    accountHolder: "Elohim Tienda Online S.A.",
    accountType: "Corriente"
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Podríamos mostrar un toast aquí, pero por simplicidad usamos alert
      alert(`${label} copiado al portapapeles`);
    } catch (err) {
      alert("Error al copiar");
    }
  };

  const handleConfirmClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    onConfirm(referenceNumber || undefined);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Card className="rounded-2xl! border! border-slate-200/80! bg-white/95! shadow-md! backdrop-blur-sm!">
      <CardHeader>
        <CardTitle className="text-lg! font-bold! text-slate-900!">
          Datos para Transferencia Bancaria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6!">
        {/* Datos bancarios */}
        <div className="space-y-4!">
          <div className="flex! items-center! justify-between! py-3! px-4! rounded-lg! bg-slate-50! border! border-slate-100!">
            <div>
              <p className="text-sm! font-semibold! text-slate-700!">Banco</p>
              <p className="text-slate-900!">{bankDetails.bankName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.bankName, "Nombre del banco")}
              className="ml-2!"
            >
              <MdContentCopy className="h-4! w-4!" />
            </Button>
          </div>

          <div className="flex! items-center! justify-between! py-3! px-4! rounded-lg! bg-slate-50! border! border-slate-100!">
            <div>
              <p className="text-sm! font-semibold! text-slate-700!">Número de Cuenta</p>
              <p className="text-slate-900! font-mono!">{bankDetails.accountNumber}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.accountNumber, "Número de cuenta")}
              className="ml-2!"
            >
              <MdContentCopy className="h-4! w-4!" />
            </Button>
          </div>

          <div className="flex! items-center! justify-between! py-3! px-4! rounded-lg! bg-slate-50! border! border-slate-100!">
            <div>
              <p className="text-sm! font-semibold! text-slate-700!">Nombre del Titular</p>
              <p className="text-slate-900!">{bankDetails.accountHolder}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.accountHolder, "Nombre del titular")}
              className="ml-2!"
            >
              <MdContentCopy className="h-4! w-4!" />
            </Button>
          </div>

          <div className="flex! items-center! justify-between! py-3! px-4! rounded-lg! bg-slate-50! border! border-slate-100!">
            <div>
              <p className="text-sm! font-semibold! text-slate-700!">Tipo de Cuenta</p>
              <p className="text-slate-900!">{bankDetails.accountType}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.accountType, "Tipo de cuenta")}
              className="ml-2!"
            >
              <MdContentCopy className="h-4! w-4!" />
            </Button>
          </div>
        </div>

        {/* Campo opcional para referencia */}
        <div className="space-y-2!">
          <label htmlFor="referenceNumber" className="block! text-sm! font-semibold! text-slate-900!">
            Número de referencia de transferencia (Opcional)
          </label>
          <Input
            id="referenceNumber"
            type="text"
            placeholder="Ej: RES-2026-00001"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full!"
          />
          <p className="text-xs! text-slate-500!">
            Ingresa el número de referencia que aparecerá en tu comprobante de transferencia
          </p>
        </div>

        {/* Botón confirmar pago */}
        <Button
          onClick={handleConfirmClick}
          disabled={isLoading}
          className="w-full! px-6! py-3! bg-gradient-to-r! from-green-600! to-green-700! text-white! rounded-full! font-semibold! hover:shadow-md! transition-shadow! hover:from-green-700! hover:to-green-800! disabled:opacity-50! disabled:cursor-not-allowed!"
        >
          {isLoading ? "Confirmando..." : "Confirmar pago"}
        </Button>

        <div className="mt-4! p-4! rounded-lg! bg-blue-50! border! border-blue-200!">
          <p className="text-xs! text-blue-700!">
            <span className="font-semibold!">Nota:</span> Una vez realizada la transferencia, tu reservación será confirmada automáticamente.
            Recibirás un correo de confirmación.
          </p>
        </div>
      </CardContent>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirmación de pago"
        message="¿Confirmas que realizaste el pago?"
        confirmText="Sí, confirmar pago"
        cancelText="Cancelar"
        isLoading={isLoading}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </Card>
  );
}