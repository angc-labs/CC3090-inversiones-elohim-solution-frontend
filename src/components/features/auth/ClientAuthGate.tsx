"use client";

import type { ReactNode } from "react";
import { ClientRoute } from "@/components/features/auth/ClientRoute";

type ClientAuthGateProps = {
  children: ReactNode;
};

export function ClientAuthGate({ children }: ClientAuthGateProps) {
  return <ClientRoute>{children}</ClientRoute>;
}
