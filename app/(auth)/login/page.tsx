import type { Metadata } from "next";
import LoginClient from "./login.client";
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login - Secure Account Access",
  description: "Sign in to your account.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginClient />
    </Suspense>
  );
}
