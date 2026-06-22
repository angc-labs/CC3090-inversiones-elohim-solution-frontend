"use client";

import type { ReactNode } from "react";

type ClientAuthGateProps = {
  children: ReactNode;
};

export function ClientAuthGate({ children }: ClientAuthGateProps) {
  return <>{children}</>;
}
