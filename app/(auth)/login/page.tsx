import type { Metadata } from "next";
import LoginClient from "./login.client";

export const metadata: Metadata = {
  title: "Login - Secure Account Access",
  description: "Sign in to your account.",
};

export default function LoginPage() {
  return <LoginClient />;
}
