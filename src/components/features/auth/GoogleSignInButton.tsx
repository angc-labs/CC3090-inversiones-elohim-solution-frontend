"use client";

import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

type GoogleSignInButtonProps = {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
};

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="filled_black"
        shape="pill"
        size="large"
        text="continue_with"
        logo_alignment="left"
      />
    </div>
  );
}

