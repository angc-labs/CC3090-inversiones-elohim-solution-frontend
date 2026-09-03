"use client";

import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

type GoogleSignInButtonProps = {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
};

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <p className="text-center! text-[11px]! text-slate-600!">
        Inicio con Google no configurado
      </p>
    );
  }

  return (
    <div className="flex! w-full! justify-center!">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="filled_black"
        shape="rectangular"
        size="large"
        text="continue_with"
        width="384"
      />
    </div>
  );
}
